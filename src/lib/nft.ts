import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createGenericFile, generateSigner, percentAmount } from '@metaplex-foundation/umi';
import { mockStorage } from '@metaplex-foundation/umi-storage-mock';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { PublicKey } from '@solana/web3.js';

const SOLANA_RPC = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: File;
  attributes: Array<{ trait_type: string; value: string }>;
  royalties: number;
}

export function getUmi(wallet: any) {
  const umi = createUmi(SOLANA_RPC)
    .use(mplTokenMetadata())
    .use(mockStorage())
    .use(walletAdapterIdentity(wallet));
  
  return umi;
}

export async function uploadImage(image: File): Promise<string> {
  try {
    const buffer = await image.arrayBuffer();
    const genericFile = createGenericFile(
      new Uint8Array(buffer),
      image.name,
      {
        uniqueName: `${Date.now()}-${image.name}`,
        contentType: image.type,
      }
    );
    
    const umi = getUmi(window.solana);
    const [imgUri] = await umi.uploader.upload([genericFile]);
    return imgUri;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

export async function uploadMetadata(
  metadata: NFTMetadata,
  imageUri: string
): Promise<string> {
  try {
    const metadataObj = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      image: imageUri,
      attributes: metadata.attributes,
      properties: {
        files: [
          {
            type: metadata.image.type,
            uri: imageUri,
          },
        ],
      },
    };
    
    const umi = getUmi(window.solana);
    const metadataUri = await umi.uploader.uploadJson(metadataObj);
    return metadataUri;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw new Error('Failed to upload metadata. Please try again.');
  }
}

export async function mintNFT(
  metadata: NFTMetadata,
  metadataUri: string,
  publicKey: PublicKey
): Promise<string> {
  try {
    const umi = getUmi(window.solana);
    const mint = generateSigner(umi);
    
    // Convert royalty percentage to basis points (1% = 100 basis points)
    // Ensure the value doesn't exceed 10000 (100%)
    const basisPoints = Math.min(Math.round(metadata.royalties * 100), 10000);
    
    await createNft(umi, {
      mint,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadataUri,
      sellerFeeBasisPoints: percentAmount(basisPoints),
      creators: [{ address: publicKey, verified: true, share: 100 }],
    }).sendAndConfirm(umi);
    
    return mint.publicKey.toString();
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw new Error('Failed to mint NFT. Please ensure you have enough SOL and try again.');
  }
}