export async function POST(request) {
  try {
    const {username, doorNumber } = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
    }

    const response = await fetch(`${apiUrl}/api/dooropen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, doorNumber }),
    })

    if (!response.ok) {
      throw new Error('Failed to send door number')
    }

    const data = await response.json()

    return Response.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Error sending door number:', error)
    return Response.json(
      {
        success: false,
        error: 'Failed to send door number',
      },
      { status: 500 }
    )
  }
}

