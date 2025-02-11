import express from 'express';

const app = express();
app.use(express.json()); // Parse JSON request body

// Function to generate the correct Sanity image URL
export function genImageUrl(ref) {
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

// Add this route to confirm the server is running
app.get('/', (req, res) => {
    res.status(200).send('Sanity Webhook Listener is running! 🚀');
});

// // Webhook Listener Route
// app.post('/sanity-webhook', async (req, res) => {
//     console.log("Webhook received:", req.body);
//     res.status(200).send("Webhook received!");
//     try {
//         const { title, url, imageRef, feature, tags, documentId, language } = req.body;
//         const imageUrl = genImageUrl(imageRef);

//         // Read GitHub credentials from environment variables
//         const githubUsername = process.env.GITHUB_USERNAME;
//         const githubRepo = process.env.GITHUB_REPO;
//         const githubPAT = process.env.REPO_PAT;

//         // Send data to GitHub Actions
//         await axios.post(
//             `https://api.github.com/repos/${githubUsername}/${githubRepo}/dispatches`,
//             {
//                 event_type: 'sanity_blog_published',
//                 client_payload: { title, url, imageUrl, feature, tags, documentId, language }
//             },
//             {
//                 headers: {
//                     Accept: 'application/vnd.github.everest-preview+json',
//                     Authorization: `Bearer ${githubPAT}`
//                 }
//             }
//         );

//         res.status(200).json({ success: true });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: error.message });
//     }
// });

// Start the server
export default app;