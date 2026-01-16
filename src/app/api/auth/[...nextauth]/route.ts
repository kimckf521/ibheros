import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Since WeChat provider might need custom configuration or specific import:
// Standard NextAuth has a 'wechat' provider.
export const authOptions: NextAuthOptions = {
  debug: true, // Enable debug messages in terminal
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log("Authorize called with:", credentials);
        // Mock User for Testing "Make sure it is working"
        if (credentials?.email === "admin@example.com" && credentials?.password === "password") {
            return { id: "1", name: "Admin User", email: "admin@example.com" };
        }
        if (credentials?.email === "user@example.com" && credentials?.password === "password") {
             console.log("User authenticated successfully");
             return { id: "2", name: "Test User", email: "user@example.com" };
        }
        console.log("Authentication failed - invalid credentials");
        return null; // Login failed
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // WeChat Provider
    {
      id: "wechat",
      name: "WeChat",
      type: "oauth",
      authorization: "https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_login&state=STATE#wechat_redirect",
      clientId: process.env.WECHAT_APP_ID,
      clientSecret: process.env.WECHAT_APP_SECRET,
      token: "https://api.weixin.qq.com/sns/oauth2/access_token",
      userinfo: "https://api.weixin.qq.com/sns/userinfo",
      profile(profile: any) {
        return {
          id: profile.openid,
          name: profile.nickname,
          email: null,
          image: profile.headimgurl,
        }
      },
    }
  ],
  pages: {
    signIn: '/login', // Custom login page
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // Ensure secret is used
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
