import { Menu } from "@/types/menu";


const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    path: "/",
    newTab: false,
  },
  {
    id: 2,
    title: "About",
    path: "/about",
    newTab: false,
  },

  {
    id: 33,
    title: "Profile",
    newTab: false,
    path: "/profile",

  },


  {
    id: 46,
    title: "Sign In",
    path: "/signin",
    newTab: false,
  },

  {
    id: 3,
    title: "Support",
    path: "/contact",
    newTab: false,
  },

  {
    id: 4,
    title: "Pages",
    newTab: false,
    submenu: [
      {
        id: 22,
        title: "Experts",
        path: "/experts",
        newTab: false,
      },

      {
        id: 34,
        title: "Expert login",
        path: "https://dashboard.aerocog.tech",
        newTab: true,
      },
      
      {
        id: 47,
        title: "Sign Up",
        path: "/signup",
        newTab: false,
      },
      /*
      {
        id: 22,
        title: "Refund Policy",
        path: "/",
        newTab: false,
      },
    
      {
        id: 43,
        title: "Blog Grid Page",
        path: "/blog",
        newTab: false,
      },
      
      {
        id: 45,
        title: "Blog Details Page",
        path: "/blog-details",
        newTab: false,
      },
      
      
      {
        id: 48,
        title: "Error Page",
        path: "/error",
        newTab: false,
      },
      */
    ],
  },


];
export default menuData;
