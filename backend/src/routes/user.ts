import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signupInput, signinInput } from "@harsh1507/medium-common";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();


//SIGNUP ROUTE
userRouter.post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    
    const body = await c.req.json();
    const { success } = signupInput.safeParse(body);
    if(!success) {
      c.status(411);
      return c.json({
        message: "Wrong Input Credentials"
      })
    }
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name,
        },
      });
      const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
      console.log(jwt);
      // return c.json({ jwt });
      return c.body("response");
    } catch (e) {
      c.status(403);
      console.log("3rd point",e);
      return c.json({ error: "error while signing up" });
    }
  });
  
  
  //SIGNIN ROUTE
  userRouter.post("/signin", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if(!success) {
      c.status(411);
      return c.json({
        message: "Wrong Input Credentials"
      })
    }
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
        password: body.password
      },
    });
  
    if (!user) {
      c.status(403);
      return c.json({ error: "user not found" });
    }
    const jwt = sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  });











//   //MIDDLEWARE
// userRouter.use('/api/v1/blog*', async (c, next) => {
//   const jwt = c.req.header("authorization") || "";
//   const user = await verify(jwt, c.env.JWT_SECRET);
//     if(!jwt){
//       c.status(401);
//       return c.json({error: "aunauthorized"});
//     }
//     const token = jwt.split("  ")[1];
//     const response = await verify(token, c.env.JWT_SECRET);
//     if(!response){
//       c.status(401);
//       return c.json({error: "unauthorized"});
//     }
//     const userId = (user as { id: string }).id;
//     c.set('userId', response.id);
//     await next()
//   })
  