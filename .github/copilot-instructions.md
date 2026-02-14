# نظام ERP المتكامل - تعليمات المشروع

## بنية المشروع / Project Structure
- **Monorepo** باستخدام npm workspaces
- **Frontend**: `apps/web/` - React 18 + Vite + TypeScript + react-router-dom
- **Backend**: `apps/api/` - Express + TypeScript + JWT + in-memory data store

## الأوامر / Commands
- تشغيل الخادم: `npm -w apps/api run dev` (port 4000)
- بناء الواجهة: `npm -w apps/web run build`
- تشغيل الواجهة: `npm -w apps/web run dev` (port 5173)

## حسابات تجريبية / Demo Accounts
- admin/admin, hr/hr, finance/finance, sales/sales, manager/manager

## الأقسام / Modules
- الموارد البشرية (HR): الموظفين، الحضور، الرواتب، الإجازات، التقييمات، التوظيف
- المالية (Finance): الحسابات، القيود، الفواتير، الذمم، التكاليف، الصناديق
- الإدارة (Admin): الممتلكات، الإيجارات، الصلاحيات
- المبيعات (Sales): العملاء، الفواتير
- المشتريات (Purchasing): الموردين، أوامر الشراء
- المخزون (Inventory): المنتجات
- الدعم (Support): التذاكر

## العملات / Currency
- الدينار العراقي (IQD / د.ع) والدولار الأمريكي (USD) فقط

## الأسلوب / Style
- RTL layout, Tajawal font, glassmorphism, CSS animations
- bilingual labels: عربي / English
- CSS variables for theming

## نظام الصلاحيات / Permissions
- 5 أدوار: admin, manager, hr, finance, sales
- 11 وحدة × 5 صلاحيات (view, create, edit, delete, export)
- إدارة الصلاحيات متاحة للمدير فقط
