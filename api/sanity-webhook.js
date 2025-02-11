// Import necessary modules
import axios from 'axios';

function genImageUrl(ref) {
    const imageBaseUrl = `https://cdn.sanity.io/images/g2pdrwyj/production/`;
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'avif', 'webp'];
    const extension = ref.split('-').slice(-1)[0];
    const hasImageExtension = imageExtensions.includes(extension);

    if (hasImageExtension) {
        return imageBaseUrl + ref.replace('image-', '').replace(`-${extension}`, `.${extension}`);
    } else {
        return null;
    }
}

export default async function handler(req, res) {
  // If the request is a GET, return a simple active message.
  if (req.method === "GET") {
    return res.status(200).json({ message: "Webhook endpoint is active. No event data." });
  }
  
  // For POST requests, first check the authorization header.
  if (req.method === "POST") {
    const authHeader = req.headers.authorization;
    const secretToken = process.env.SANITY_WEBHOOK_SECRET; // Loaded from Vercel environment

    // Verify the token is present and correct.
    if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    // Log the incoming webhook data.
    console.log("Webhook received:", req.body);

    try {
      // Destructure the expected fields from the webhook payload.
      const { title, url, imageRef, feature, tags, documentId, language } = req.body;
      // Transform the image reference to a full URL using your helper.
      const imageUrl = genImageUrl(imageRef);

      // Read GitHub credentials from environment variables.
      const githubUsername = process.env.GITHUB_USERNAME;
      const githubRepo = process.env.GITHUB_REPO;
      const githubPAT = process.env.REPO_PAT;

      // Send data to GitHub Actions by triggering a repository dispatch event.
      await axios.post(
        `https://api.github.com/repos/${githubUsername}/${githubRepo}/dispatches`,
        {
          event_type: 'sanity_blog_published',
          client_payload: { title, url, imageUrl, feature, tags, documentId, language }
        },
        {
          headers: {
            Accept: 'application/vnd.github.everest-preview+json',
            Authorization: `Bearer ${githubPAT}`
          }
        }
      );

      return res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  // If the method is not GET or POST, return 405 Method Not Allowed.
  return res.status(405).json({ error: "Method Not Allowed" });
}
