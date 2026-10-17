# Plant Nursery Management System

A web-based Plant Nursery Management System built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). The application is designed to simplify plant browsing, inventory management, customer registration, and plant purchasing through a user-friendly interface.

## Features

### Customer Module
- Customer registration and login
- Browse available plants
- View plant details and prices
- Purchase plants
- View purchase details and order history

### Admin Module
- Secure administrator login
- Manage plant categories
- Add, edit, delete, and view plant listings
- View registered customers
- Manage nursery inventory

## Technology Stack

| Technology | Purpose |
|---|---|
| MongoDB | Database |
| Express.js | Backend web framework |
| React.js | Frontend user interface |
| Node.js | Backend runtime |
| REST API | Communication between frontend and backend |

## Project Structure

```text
plantnursery/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── .gitignore
└── README.md
```

*Note: The directory structure above is illustrative. Actual folders and files may differ.*

## Prerequisites

Install the following before running the project:

- Node.js and npm
- MongoDB Community Server or MongoDB Atlas
- Git

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/alansaji-01/plantnursery.git
cd plantnursery
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the environment variables required by your application. For example:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/jeevanam
```

Use the actual variable names expected by your backend code. Do not upload credentials or secret keys to GitHub.

### 3. Start the Backend

```bash
npm start
```

If your backend does not define a `start` script, check `backend/package.json`. If appropriate, run:

```bash
node server.js
```

### 4. Configure and Start the Frontend

Open a second terminal:

```bash
cd plantnursery/frontend
npm install
npm start
```

If your frontend uses Vite instead of Create React App, use the script specified in `frontend/package.json`, commonly `npm run dev`.

### 5. Open the Application

Use the local URL displayed in your frontend terminal. For Create React App, this is commonly:

```text
http://localhost:3000
```

The backend runs on the port configured in its environment or server configuration.

## Database

The application uses MongoDB to store its data. Configure the database connection using the environment variable expected by the backend. The database name shown in the example is `jeevanam`; change it if your application uses a different database.

## Security Notes

- Keep `.env` files out of version control.
- Never publish database passwords, API keys, or authentication secrets.
- Validate user input on the server.
- Apply appropriate authorization checks to administrative operations.
- Store passwords using secure password hashing.

## Future Enhancements

- Online payment integration
- Plant search and category filtering
- Shopping cart improvements
- Order status tracking
- Responsive UI enhancements
- Inventory and sales reports

## License

This project is intended for academic and educational purposes. Add a license file if you wish to specify formal reuse and distribution terms.

## Author

**Alan Saji**

GitHub: [@alansaji-01](https://github.com/alansaji-01)
