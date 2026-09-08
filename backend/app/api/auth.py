from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth
from app.core.config import get_settings
from app.core.database import get_db
from app.models.user import User
from app.core.auth import create_access_token, get_current_user

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["Auth"])

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID or "DUMMY",
    client_secret=settings.GOOGLE_CLIENT_SECRET or "DUMMY",
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

oauth.register(
    name='github',
    client_id=settings.GITHUB_CLIENT_ID or "DUMMY",
    client_secret=settings.GITHUB_CLIENT_SECRET or "DUMMY",
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'read:user user:email'},
)

@router.get("/google/login")
async def login_via_google(request: Request):
    redirect_uri = settings.OAUTH_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def auth_via_google(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth authorization failed: {str(e)}")

    user_info = token.get('userinfo')
    if not user_info:
        raise HTTPException(status_code=400, detail="No user info returned from Google")

    email = user_info.get("email")
    google_id = user_info.get("sub")
    name = user_info.get("name")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=name, google_id=google_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not user.google_id:
        user.google_id = google_id
        db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    redirect_url = f"{settings.FRONTEND_URL}/login?token={access_token}"
    return RedirectResponse(url=redirect_url)

@router.get("/github/login")
async def login_via_github(request: Request):
    redirect_uri = settings.GITHUB_OAUTH_REDIRECT_URI
    return await oauth.github.authorize_redirect(request, redirect_uri)

@router.get("/github/callback")
async def auth_via_github(request: Request, db: Session = Depends(get_db)):
    try:
        token = await oauth.github.authorize_access_token(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth authorization failed: {str(e)}")

    resp = await oauth.github.get('user', token=token)
    user_info = resp.json()
    
    if not user_info:
        raise HTTPException(status_code=400, detail="No user info returned from GitHub")

    email = user_info.get("email")
    if not email:
        email_resp = await oauth.github.get('user/emails', token=token)
        emails = email_resp.json()
        primary_email = next((e['email'] for e in emails if e.get('primary')), None)
        email = primary_email or (emails[0]['email'] if emails else None)
        
    if not email:
        raise HTTPException(status_code=400, detail="GitHub account has no email address")

    github_id = str(user_info.get("id"))
    name = user_info.get("name") or user_info.get("login") or "GitHub User"
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=name, github_id=github_id)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif not getattr(user, 'github_id', None):
        user.github_id = github_id
        db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})
    redirect_url = f"{settings.FRONTEND_URL}/login?token={access_token}"
    return RedirectResponse(url=redirect_url)

@router.get("/me")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "role": current_user.role,
        "google_id": current_user.google_id
    }
