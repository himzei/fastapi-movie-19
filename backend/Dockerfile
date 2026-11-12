FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY main.py .

# 루트 권한 없이 실행
RUN useradd --create-home appuser
USER appuser

EXPOSE 8000

# TMDB 키는 이미지에 넣지 않고 docker-compose 의 env_file(backend/.env)로 주입
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers"]
