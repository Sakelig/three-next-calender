export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      throw new Error('WAIFU_API_URL environment variable is not set');
    }

    const response = await fetch(apiUrl + "/api/test");

    if (!response.ok) {
      throw new Error('Failed to fetch waifu data');
    }

    const waifuData = await response.json();

    return Response.json({
      message: "Hello World",
      waifuData: waifuData
    });
  } catch (error) {
    console.error('Error fetching waifu data:', error);

    return Response.json(
      {
        message: "Hello World",
        error: "Failed to fetch waifu data"
      },
      { status: 500 }
    );
  }
}
