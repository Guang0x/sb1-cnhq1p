import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateImage(prompt: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "url",
    });

    const imageUrl = response.data[0].url;
    if (!imageUrl) throw new Error('No image URL received');

    // Convert URL to File object
    const imageResponse = await fetch(imageUrl);
    const blob = await imageResponse.blob();
    const file = new File([blob], 'dalle-generated.png', { type: 'image/png' });

    // Upload to Storacha using the NFT library's uploader
    const { uploadImage } = await import('./nft');
    const storachaUrl = await uploadImage(file);

    return storachaUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate and upload image');
  }
}