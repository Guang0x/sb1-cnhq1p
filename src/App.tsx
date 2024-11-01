import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';
import { uploadImage, uploadMetadata, mintNFT, type NFTMetadata } from './lib/nft';
import NFTForm from './components/NFTForm';

function App() {
  const { publicKey } = useWallet();
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMint = async (metadata: NFTMetadata) => {
    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setStatus('Uploading image...');
      setError('');

      const imageUri = await uploadImage(metadata.image);
      
      setStatus('Uploading metadata...');
      const metadataUri = await uploadMetadata(metadata, imageUri);

      setStatus('Minting NFT...');
      const mintAddress = await mintNFT(metadata, metadataUri, publicKey);

      setStatus(`Success! Minted NFT: ${mintAddress}`);
    } catch (err) {
      console.error('Mint error:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-lg text-gray-900">
          <h1 className="text-3xl font-bold mb-8 text-center">Solana NFT Minter</h1>
          
          <div className="flex justify-center mb-8">
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
          </div>

          {publicKey && (
            <NFTForm onSubmit={handleMint} isLoading={isLoading} />
          )}

          {status && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900">{status}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;