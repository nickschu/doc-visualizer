import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Grab the form data from the incoming request
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { message: "No file found in the request" },
        { status: 400 }
      );
    }

    // 2. Create a new FormData to forward to FastAPI
    const forwardFormData = new FormData();
    forwardFormData.append("file", file);

    // 3. Forward the form data to the FastAPI backend
    const backendRes = await fetch(`${process.env.BACKEND_API_URL}/upload-doc`, {
      method: "POST",
      body: forwardFormData,
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      return NextResponse.json(
        { message: `Failed to upload: ${errText}` },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
