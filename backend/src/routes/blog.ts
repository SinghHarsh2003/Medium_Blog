import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { createBlogInput, updatePostInput } from "@harsh1507/medium-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  //extract userId
  //pass it down to the route handler
  const authHeader = c.req.header("authorization") || "";
  
  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);

    if (user) {
      // const userId = (user as { id: string }).id; // Type assertion
      const userId = (user as { id: string }).id; // Type assertion
      c.set("userId", userId);
      await next();
    } else {
      c.status(403);
      return c.json({
        message: "YOU ARE NOT LOGGED IN",
      });
    }
  } catch {
    c.status(403);
    return c.json({
      message: "YOU ARE NOT LOGGED IN",
    });
  }
});

blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  if(!success) {
    c.status(411);
    return c.json({
      message: "Wrong Input Credentials"
    })
  }
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const blog = await prisma.post.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: authorId,
    },
  });
  return c.json({
    id: blog.id,
  });
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();
  const { success } = updatePostInput.safeParse(body);
  if(!success) {
    c.status(411);
    return c.json({
      message: "Wrong Input Credentials"
    })
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    id: post.id,
  });
});

//have to add pagination

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const posts = await prisma.post.findMany({});

  return c.json({ posts });
});

blogRouter.get("/:id", async (c) => {
  const id = await c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.findFirst({
      where: {
        id: id,
      },
    });
    return c.json({
      post,
    });
  } catch (e) {
    c.status(411);
    return c.json({
      error: "ERROR WHILE FETCHING THE BLOG",
    });
  }
});
