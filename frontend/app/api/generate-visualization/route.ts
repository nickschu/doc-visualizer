import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body from the request
    const body = await request.json();
    const { doc_id } = body;

    if (!doc_id) {
      return NextResponse.json({ error: "Missing doc_id in request body." }, { status: 400 });
    }

    // Fetch from FastAPI backend
    const backendUrl = process.env.BACKEND_API_URL; 
    if (!backendUrl) {
      return NextResponse.json({ error: "No BACKEND_URL set in environment." }, { status: 500 });
    }

    // Make a POST request to FastAPI route (/generate-visualization)
    const fastApiRes = await fetch(`${backendUrl}/generate-visualization`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "doc_id" : doc_id }),
    });

    // If the FastAPI response is not OK, return the error
    if (!fastApiRes.ok) {
      const errorText = await fastApiRes.text();
      return NextResponse.json({ error: errorText }, { status: fastApiRes.status });
    }

    // Otherwise, parse and return the JSON from FastAPI
    const data = await fastApiRes.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("Error in /api/generate-visualization:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error?.message },
      { status: 500 }
    );
  }
}