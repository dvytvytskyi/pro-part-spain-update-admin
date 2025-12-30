const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: "dgv0rxd60",
    api_key: "949652851852698",
    api_secret: "G1rqbfM9Pkx0FdwfVVi3D4SudV4",
});

const NEWS_FILE = path.join(__dirname, '../src/data/news.json');

const newImages = [
    "https://www.barringtonhomes.eu/img/holiday-properties/2021/09/s284-new-developments-estepona110.jpg",
    "https://media.rightmove.co.uk/270k/269678/170290094/269678_ANNG119G3_3_IMG_00_0000.jpeg",
    "https://www.granmarbellaresort.com/wp-content/uploads/2025/09/Gran-Marbella-Resort_Amu-Beach-Club-Day-Bed-1440x900.png",
    "https://www.spainpropertyforyou.es/wp-content/uploads/Apartments-for-sale-in-Marbella_001.jpg",
    "https://www.marbellaforsale.com/devs/pics/509-5.jpg",
    "https://marbella-cribs.com/wp-content/uploads/2025/06/luxury-apartment-for-sale-in-lomas-de-marbella-Club-33.jpg",
    "https://www.mare-marbella.com/wp-content/uploads/2025/05/Mare-Apartments-Marbella--scaled.jpg",
    "https://villageverdesotogrande.com/wp-content/uploads/2021/06/best-luxury-apartments-sotogrande-foto.jpg",
    "https://media.inmobalia.com/imgV1/B98Le8~d7M9k3DegigWkzHXQlgzMFGqGJJp6ZRUcpX033lqadFBp2i4GGW4X2J1jIJ9Pwc6GsJX5cPSaC8Y5L~JfyHdt9VtHcgHlzI_VqiZ1ufgCkgsV2X0aAQF8pO3ABUAcEsvmTu~9iubn25_0UwXlI7_PYAJUoSnTh3sabOrwOj1CCOJ5QR84tEPtglKS4AxarupXscImbvE~KqfV5YcVLwb4A9M3a9uQYg~xPs0yhk2LePwv6semYxKnx~IWXWPUNFFFdqYvy~RLXLQx3U0kN~cFK~Ei3dc0yz6CKhGwwXXYMb7iS81AcPo0biX1XA--.jpg",
    "https://swishmarbella.com/wp-content/uploads/2023/06/Villa-Estrella-Altos-Puente-Romano-Marbella-cover.jpg",
    "https://www.vacation-key.com/photos/1/2/127951-1.jpg",
    "https://media.inmobalia.com/imgV1/B95mbh8olwFQm~uCUaVOI2kQT0hb0a8sZ9turUNfnwtvuccYCzs0YVPfPbfkc2VnnN1JFDpiVdhTScitlOnQDySlvzmz7r7zXGJP8~gRKgG3zWw03i2RdmZyQIyuw~9AMnnFH6w4J5QGMAHhDPHnIvRlFMkr4fBnZgjavEgVXYjb0ZDAwORfPEGg~YFKBWuZcoAftyX_LzQSUS5oDleOzrSBV0hDtXJVgjo4RzZIgRnvoElUQMaEnAKewA6e4jJIE4J0rGQVS2nXEdkVfXrrM0TN_txJV~pBibVwg0Xsg9PojRrJRXqW8Apa2qlBtYkk8qdttRT2gFaoJl0PsgJ7MfQI70pAGz68YpEYxU5N2ijgUabG2SNxjqisb6DT73bgOIXsnQ--.jpg",
    "https://media.inmobalia.com/imgV1/B98Le8~d7M9k3DegigWkzHXQlgzMFGqGJJp6ZRUcpX033lqadFBp2i4GGW4X3JDm~11J_coE7XMgSyFWgioo4vCKf4wUKnMT1s0ybeUY1aK9veP7GXSFmQqrQ2LV6YTtR0YYdI2d6x~YzVWFv6KXsKpzxGpcI9rUXFm73ixMGUPF628KTf~gHxx_Q~6nzilhyIot23oOlvLXdkv5UpNfssMEGNpqIfKw7hH5P8RztARG6s6jNfAyI29hGKGWmsgU7Yp9Dv2HVpTPZAdlCszG7XQp2JDY4sjOHlSfseEcn1raJOhwXBW~VS94KkmHexUHcq6aHDWXh6Hdt0vtNLWMlY~DZ8Es4IbTzRObpw~n8fSO_tIqGIRgdN5WeQ--.jpg",
    "https://images.prismic.io/exclusivemarbella/aADNi-vxEdbNPLbR_DJI_0250.jpg?auto=format,compress",
    "https://images.trvl-media.com/lodging/113000000/112500000/112497800/112497706/2b3cb62b.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill"
];

async function updateImages() {
    try {
        const fileContent = fs.readFileSync(NEWS_FILE, 'utf8');
        const news = JSON.parse(fileContent);

        console.log(`Processing ${news.length} articles...`);

        for (let i = 0; i < news.length; i++) {
            const imageUrl = newImages[i];
            if (imageUrl) {
                console.log(`Uploading image for article ${i + 1}: ${imageUrl}`);
                try {
                    const result = await cloudinary.uploader.upload(imageUrl, {
                        folder: 'news',
                    });
                    news[i].image_url = result.secure_url;
                    news[i].featured_image_url = result.secure_url;
                    console.log(`Updated article ${i + 1} with ${result.secure_url}`);
                } catch (err) {
                    console.error(`Failed to upload image for article ${i + 1}:`, err.message);
                    // Fallback to original URL if upload fails
                    news[i].image_url = imageUrl;
                    news[i].featured_image_url = imageUrl;
                }
            }
        }

        fs.writeFileSync(NEWS_FILE, JSON.stringify(news, null, 4));
        console.log('Successfully updated news.json');
    } catch (error) {
        console.error('Error updating news images:', error);
    }
}

updateImages();
