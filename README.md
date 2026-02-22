# Power Consumption Prediction Frontend

This is the React-based frontend application for the Power Consumption Prediction system. It provides a user-friendly interface for monitoring device consumption, viewing predictive analytics, and managing energy usage.

## 📁 Folder Structure

The project follows a modular, feature-based structure to ensure scalability and maintainability:

- **`src/`**: Core source code directory.
  - **`app/`**: Global application configuration, including the Redux store setup (`store.ts`).
  - **`components/`**: Reusable UI components.
    - **`ui/`**: Low-level, base UI components (buttons, inputs, dialogs) primarily from shadcn/ui.
    - **`layout/`**: Layout-specific components like `DashboardLayout` and `Navbar`.
  - **`features/`**: Functional modules of the application. Each feature contains its own logic, slices, and specific components.
    - `auth/`: Login, registration, and user profile management.
    - `devices/`: CRUD operations and management for user devices.
    - `consumption/`: Historical data viewing and Excel file uploads.
    - `prediction/`: Generating and visualizing power usage predictions.
    - `dashboard/`: Overview analytics for both user and admin levels.
    - `alerts/`: Setting and managing consumption thresholds and notifications.
    - `reports/`: Generation and downloading of PDF/Excel reports.
    - `admin/`: Admin-specific tools for user management, logs, and categories.
  - **`hooks/`**: Global custom React hooks for shared logic across the app.
  - **`pages/`**: Higher-level components representing entire pages, which compose features and UI elements.
  - **`services/`**: API integration layer.
    - `axiosInstance.ts`: Centralized Axios configuration for base URL, headers, and interceptors.
    - `apiEndpoints.ts`: Definition of all backend API routes.
  - **`routes/`**: Routing logic and role-based protection (`ProtectedRoute`).
  - **`lib/`**: Shared utility functions (e.g., `utils.ts` for Tailwind class merging).
  - **`test/`**: Test utilities and setup.

## 🔄 Data Flow

The application manages data through a combination of global state management and server-state caching:

1.  **User Interaction**: The user interacts with components in the `pages` or `features` layer.
2.  **State Management**:
    - **Redux (via Redux Toolkit)**: Used for managing synchronous and complex global application state, such as authentication status, user profile, and shared UI states.
    - **React Query (TanStack Query)**: Primary tool for fetching, caching, and synchronizing server state. It handles loading/error states and automatic refetching for data like consumption history and predictions.
3.  **API Layer**: All network requests are handled through a centralized Axios instance. It handles automatic attachment of auth tokens and centralized error handling (session expiration, etc.).
4.  **Backend Integration**: The frontend communicates with the Django backend via REST APIs defined in `apiEndpoints.ts`.
5.  **Reactive Updates**: UI components react to state changes. For example, uploading a consumption file triggers a React Query invalidation, which automatically refreshes the history list and dashboard charts.

## 🛠️ Technologies Used

- **Vite**: For fast development and optimized builds.
- **TypeScript**: Ensuring type safety across the application.
- **React**: Modern component-based library for building user interfaces.
- **shadcn-ui**: For high-quality, accessible UI components.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Redux Toolkit**: Efficient global state management.
- **TanStack Query (React Query)**: Powerful data fetching and caching.
- **Axios**: Promised-based HTTP client for API requests.
- **Framer Motion**: For smooth UI animations and transitions.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or bun

### Installation

1.  Clone the repository.
2.  Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```
3.  Install dependencies:
    ```sh
    npm install
    # or
    bun install
    ```
4.  Set up environment variables:
    Ensure your `.env` file points to the correct backend API URL:
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    ```

### Development

Start the development server with auto-reloading:

```sh
npm run dev
```

The application will be available at `http://localhost:8080`.

## 📦 Build and Deployment

To create a production build:

```sh
npm run build
```

The optimized files will be generated in the `dist` directory.
