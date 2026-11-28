"""UTM tags for the links in posts, so Google Analytics shows which kind of post (and which network) brings visitors.

A caption is written once for both networks, with the placeholder in utm_source; `for_network` fills it in
right before a caption is sent to Facebook or Instagram. Captions without a link pass through unchanged."""
from urllib.parse import urlencode

SOURCE_PLACEHOLDER = "@network@"


def tagged(url: str, campaign: str, content: str = "") -> str:
    """url + ?utm_source=@network@&utm_medium=social&utm_campaign=<campaign>[&utm_content=<content>]"""
    params = [("utm_source", SOURCE_PLACEHOLDER), ("utm_medium", "social"), ("utm_campaign", campaign)]
    if content:
        params.append(("utm_content", content))
    return f"{url}{'&' if '?' in url else '?'}{urlencode(params, safe='@')}"


def for_network(caption: str, network: str) -> str:
    """network: 'facebook' or 'instagram'"""
    return caption.replace(SOURCE_PLACEHOLDER, network)
