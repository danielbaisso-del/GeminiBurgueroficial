# Usage: edit the placeholders below, then run this script locally in PowerShell.
# It uses the Vercel CLI. Install it and login before running: `npm i -g vercel` then `vercel login`.

# Variables to update by you:
$FRONTEND_PROJECT = "<FRONTEND_PROJECT_SLUG_OR_NAME>"    # ex: gemini-burger-frontend
$BACKEND_PROJECT  = "<BACKEND_PROJECT_SLUG_OR_NAME>"     # ex: gemini-burger-backend
$FRONTEND_URL    = "https://<SEU_FRONTEND_URL>"        # ex: https://gemini-burgueroficial.vercel.app
$BACKEND_URL     = "https://<SEU_BACKEND_URL>"         # ex: https://gemini-burger-backend.vercel.app

# --- FRONTEND (non-secret client vars) ---
Write-Host "Adding frontend environment variables to project: $FRONTEND_PROJECT"
vercel env add VITE_API_URL "$BACKEND_URL" production --project $FRONTEND_PROJECT
vercel env add VITE_GEMINI_API_KEY "" production --project $FRONTEND_PROJECT
vercel env add FRONTEND_URL "$FRONTEND_URL" production --project $FRONTEND_PROJECT

# --- BACKEND (secrets) ---
Write-Host "\nNow add backend secrets (you will be prompted to paste secret values)."
Write-Host "Make sure to keep these secret values safe and do NOT commit them to git."

Write-Host "Adding DATABASE_URL (paste your MySQL connection string when asked)"
vercel env add DATABASE_URL production --project $BACKEND_PROJECT

Write-Host "Adding JWT_SECRET (paste a strong secret when asked)"
vercel env add JWT_SECRET production --project $BACKEND_PROJECT

Write-Host "Adding MERCADOPAGO_ACCESS_TOKEN (paste MercadoPago token when asked)"
vercel env add MERCADOPAGO_ACCESS_TOKEN production --project $BACKEND_PROJECT

Write-Host "Adding optional FRONTEND_URL, NODE_ENV and PORT"
vercel env add FRONTEND_URL "$FRONTEND_URL" production --project $BACKEND_PROJECT
vercel env add NODE_ENV production --project $BACKEND_PROJECT
vercel env add PORT 3333 production --project $BACKEND_PROJECT

Write-Host "\nDone adding env vars. You should now redeploy your projects."
Write-Host "To redeploy (frontend): cd frontend; vercel --prod"
Write-Host "To redeploy (backend): cd backend; vercel --prod"

Write-Host "If you prefer using the Vercel dashboard, open the project → Settings → Environment Variables and paste the same values there (mark secrets as encrypted)."
