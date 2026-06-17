import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import PostsPage from "@/pages/PostsPage";
import PostDetailPage from "@/pages/PostDetailPage";
import CategoryPage from "@/pages/CategoryPage";
import SubCategoryPage from "@/pages/SubCategoryPage";

import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminPostsPage from "@/pages/admin/AdminPostsPage";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminTagsPage from "@/pages/admin/AdminTagsPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import RequireAdminAuth from "@/pages/admin/RequireAdminAuth";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/categories/:category" element={<CategoryPage />} />
      <Route
        path="/categories/:category/:subcategory"
        element={<SubCategoryPage />}
      />

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<RequireAdminAuth />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/posts" element={<AdminPostsPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/tags" element={<AdminTagsPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

