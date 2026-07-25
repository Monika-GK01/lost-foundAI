import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.anyio
async def test_match_endpoint_requires_body():
    """Test that the match endpoint returns 422 without a body."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/match", json={})
    # Should return 422 for missing required fields
    assert response.status_code == 422


@pytest.mark.anyio
async def test_embedding_endpoint_requires_image():
    """Test that the embedding endpoint returns 422 without an image."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/embed")
    assert response.status_code == 422
