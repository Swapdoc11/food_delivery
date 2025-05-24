import { NextResponse } from "next/server";
import { connectDB } from "../../lib/db";
import Product from "../../lib/add_product";
import formidable from "formidable";
import { Readable } from "stream";
import path from "path";

// Disable Next.js body parser
export const config = {
    api: {
        bodyParser: false,
    },
};

// Helper to convert Next.js Request to Node.js-like IncomingMessage
async function webRequestToNodeRequest(req) {
    const contentType = req.headers.get("content-type");
    const contentLength = req.headers.get("content-length");
    const headers = {};
    if (contentType) headers["content-type"] = contentType;
    if (contentLength) headers["content-length"] = contentLength;

    // Read the body as a buffer
    const bodyBuffer = Buffer.from(await req.arrayBuffer());
    const stream = Readable.from(bodyBuffer);

    // Attach headers to the stream (formidable expects this)
    stream.headers = headers;
    return stream;
}

export async function POST(req) {
    try {
        await connectDB();

        // Convert the web Request to a Node.js-like stream with headers
        const nodeReq = await webRequestToNodeRequest(req);

        // Parse form data
        const form = formidable({ multiples: false, uploadDir: "./public/uploads", keepExtensions: true });
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(nodeReq, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        // Get image path
        let imagePath = "";
        if (files.image) {
            imagePath = "/uploads/" + path.basename(files.image.filepath);
        }

        const product = await Product.create({
            name: fields.name,
            description: fields.description,
            price: fields.price,
            category: fields.category,
            image: imagePath,
        });

        return NextResponse.json(
            { message: "Product added successfully", product },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add product", details: error.message },
            { status: 500 }
        );
    }
}
export async function GET() {
    return NextResponse.json({ message: "Hello World" }, { status: 200 });
}