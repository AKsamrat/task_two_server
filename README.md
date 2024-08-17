## <code style="color:green"> Website Name: SuperMarket</code>

### <code style="color:aqua"> Live Link:</code>

```bash
https://scic-task-two.netlify.app
```

## Tech

Super Market uses a number of open source projects to work properly:

- [node.js](https://nodejs.org/)
- [express.js](https://expressjs.com/)
- [mongodb](https://mongodb.com/)

## Installation

To set up the client locally, follow these steps:

**Clone the repository:**

```bash
   > git clone  https://github.com/AKsamrat/task_two_server
   >cd task_two_server
   > npm install
   > Create a .env file in the root directory and add the required environment variables (see the Environment Variables section).
   >run nodemon index.js
```

## Environment Variables

To set up the server locally, follow these steps:

```bash
VITE_API_URL = "http://localhost:5173"
DB_USER= Your database user
DB_PASS= Your Database Password
```

## Deployment

1.  **Deploying to vercel**

Create a new project :

1. Install Firebase CLI:

   ```bash
    vercel --prod
   ```

   or

1. Push your code in github
1. Connect your vercel with your github
1. select your github project and add environment variable
