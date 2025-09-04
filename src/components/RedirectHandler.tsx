import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Alert,
  Button,
  CircularProgress
} from '@mui/material';
import { Launch as LaunchIcon, Error as ErrorIcon } from '@mui/icons-material';

interface URLData {
  id: string;
  originalUrl: string;
  shortcode: string;
  validityMinutes: number;
  createdAt: Date;
  expiryDate: Date;
  clicks: number;
}

const RedirectHandler: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState<URLData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!shortcode) {
      setError('Invalid short URL');
      setLoading(false);
      return;
    }

    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      const allUrls = JSON.parse(sessionStorage.getItem('allUrls') || '[]') as URLData[];
      const foundUrl = allUrls.find(u => u.shortcode === shortcode);

      if (!foundUrl) {
        setError('Short URL not found');
        setLoading(false);
        return;
      }

      // Convert date strings back to Date objects
      foundUrl.createdAt = new Date(foundUrl.createdAt);
      foundUrl.expiryDate = new Date(foundUrl.expiryDate);

      if (new Date() > foundUrl.expiryDate) {
        setError('This link has expired');
        setLoading(false);
        return;
      }

      // Increment click count
      foundUrl.clicks++;
      const updatedUrls = allUrls.map(u => u.shortcode === shortcode ? foundUrl : u);
      sessionStorage.setItem('allUrls', JSON.stringify(updatedUrls));

      setUrl(foundUrl);
      setLoading(false);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.href = foundUrl.originalUrl;
      }, 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [shortcode]);

  const handleManualRedirect = () => {
    if (url) {
      window.location.href = url.originalUrl;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Redirecting...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we redirect you to your destination
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="error">
              Oops!
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/'}
            >
              Go to URL Shortener
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <LaunchIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Redirecting to destination
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, wordBreak: 'break-all' }}>
            {url?.originalUrl}
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            You will be automatically redirected in a few seconds...
          </Alert>
          <Button
            variant="contained"
            startIcon={<LaunchIcon />}
            onClick={handleManualRedirect}
          >
            Go Now
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RedirectHandler;