@echo off
echo ============================================
echo   ERP System Deployment - Render.com
echo ============================================
echo.
echo GitHub Repo: https://github.com/BGHUSSEINSASH/erp-system-iq
echo.
echo === Deploy to Render.com ===
echo 1. Open: https://render.com/deploy?repo=https://github.com/BGHUSSEINSASH/erp-system-iq
echo 2. Sign up / Log in with GitHub
echo 3. Click "Apply" - done!
echo.
echo === Pushing latest code to GitHub ===
git add -A
git commit -m "Update ERP System"
git push origin master
echo.
echo Code pushed! Render.com will auto-deploy.
echo.
echo ============================================
echo   Done! Your app will be live on Render.com
echo ============================================
pause
