import "./App.scss";
import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import {
  ROUTES,
  privateRouteList,
  protectedRouteList,
  publicRouteList,
} from "./utils/constants/route";
import FallbackSpinner from "./components/common/FallbackSpinner";
import RouteChangeListener from "./components/postAd/RouteChangeListener";

const ScrollToTop = lazy(() => import("./components/common/ScrollToTop"));
const MuiSnackbar = lazy(() => import("./components/common/MuiSnackbar"));
const Page404 = lazy(() => import("./components/errorPages/Page404"));
const PublicRoute = lazy(() => import("./components/routes/PublicRoute"));
const PrivateRoute = lazy(() => import("./components/routes/PrivateRoute"));
const ProtectedRoute = lazy(() => import("./components/routes/ProtectedRoute"));

const PublicRootComponent = publicRouteList.component;
const PrivateRootComponent = privateRouteList.component;
import ComingSoonWrapper from "./components/common/ProductionRouteWrapper";

function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<FallbackSpinner />}>
        <MuiSnackbar />
      </Suspense>
      <RouteChangeListener />
      <Routes>
        <Route path="/">
          <Route
            exact
            path="/"
            element={
              <PublicRoute>
                <Navigate to={ROUTES.login}></Navigate>
              </PublicRoute>
            }
          />

          <Route
            key={publicRouteList.id}
            path={publicRouteList.path}
            element={
              <PublicRoute>
                <PublicRootComponent />
              </PublicRoute>
            }
          >
            {publicRouteList.child.map(({ id, component: Component, path }) => (
              <Route
                key={id}
                path={path}
                element={
                  <PublicRoute>
                    <Component />
                  </PublicRoute>
                }
              />
            ))}
          </Route>

          {protectedRouteList.map(
            ({ id, component: Component, path, child }) => (
              <Route
                key={id}
                path={path}
                element={
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                }
              >
                {child.map(({ id, component: Component, path }) => (
                  <Route
                    key={id + path}
                    path={path}
                    element={
                      <ProtectedRoute>
                        <Component />
                      </ProtectedRoute>
                    }
                  />
                ))}
              </Route>
            )
          )}

          <Route
            key={privateRouteList.id}
            path={privateRouteList.path}
            element={
              <PrivateRoute requiredRoles={privateRouteList.roles}>
                <PrivateRootComponent />
              </PrivateRoute>
            }
          >
            {privateRouteList.child.map(
              ({ id, component: Component, path, roles }) => (
                <Route
                  key={id}
                  path={path}
                  element={
                    <PrivateRoute requiredRoles={roles}>
                      <ComingSoonWrapper>
                        <Component />
                      </ComingSoonWrapper>{" "}
                    </PrivateRoute>
                  }
                />
              )
            )}
          </Route>
        </Route>

        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

export default App;
