import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router'

import { AdminHomePage } from '@/admin/pages/AdminHomePage'
import { BlogFormPage } from '@/admin/pages/BlogFormPage'
import { BlogListPage as AdminBlogListPage } from '@/admin/pages/BlogListPage'
import { ChatConversationDetailPage } from '@/admin/pages/ChatConversationDetailPage'
import { ChatListPage } from '@/admin/pages/ChatListPage'
import { ContactDetailPage } from '@/admin/pages/ContactDetailPage'
import { ContactListPage } from '@/admin/pages/ContactListPage'
import { ContentEditorPage } from '@/admin/pages/ContentEditorPage'
import { LoginPage } from '@/admin/pages/LoginPage'
import { ProjectFormPage } from '@/admin/pages/ProjectFormPage'
import { ProjectListPage } from '@/admin/pages/ProjectListPage'
import { AdminLayout } from '@/admin/components/AdminLayout'
import { AuthProvider } from '@/admin/auth/AuthContext'
import { ProtectedRoute } from '@/admin/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { queryClient } from '@/lib/queryClient'
import { BlogListPage } from '@/pages/BlogListPage'
import { BlogPostPage } from '@/pages/BlogPostPage'
import { HomePage } from '@/pages/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminHomePage />} />
                <Route path="/admin/content" element={<ContentEditorPage />} />
                <Route path="/admin/projects" element={<ProjectListPage />} />
                <Route path="/admin/projects/new" element={<ProjectFormPage />} />
                <Route path="/admin/projects/:id/edit" element={<ProjectFormPage />} />
                <Route path="/admin/blog" element={<AdminBlogListPage />} />
                <Route path="/admin/blog/new" element={<BlogFormPage />} />
                <Route path="/admin/blog/:id/edit" element={<BlogFormPage />} />
                <Route path="/admin/contact" element={<ContactListPage />} />
                <Route path="/admin/contact/:id" element={<ContactDetailPage />} />
                <Route path="/admin/chat" element={<ChatListPage />} />
                <Route path="/admin/chat/:id" element={<ChatConversationDetailPage />} />
              </Route>
            </Route>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
