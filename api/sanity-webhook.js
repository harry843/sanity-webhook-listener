export default async function handler(req, res) {
    // 1️⃣ Verify the request is a POST request
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // 2️⃣ Check for Authorization Header
    const authHeader = req.headers.authorization;
    const secretToken = process.env.SANITY_WEBHOOK_SECRET; // Load secret from Vercel env

    if (!authHeader || authHeader !== `Bearer ${secretToken}`) {
        return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    // 3️⃣ Log and process the webhook data
    const data = req.body;
    console.log("✅ Webhook Data Received:", data);
    try {
                const { title, url, imageRef, feature, tags, documentId, language } = req.body;
                const imageUrl = genImageUrl(imageRef);
        
                // Read GitHub credentials from environment variables
                const githubUsername = process.env.GITHUB_USERNAME;
                const githubRepo = process.env.GITHUB_REPO;
                const githubPAT = process.env.REPO_PAT;
        
                // Send data to GitHub Actions
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
        
                res.status(200).json({ success: true });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: error.message });
            }
}


