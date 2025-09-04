import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Launch as LaunchIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

interface URLData {
  id: string;
  originalUrl: string;
  shortcode: string;
  validityMinutes: number;
  createdAt: Date;
  expiryDate: Date;
  clicks: number;
}

const Statistics: React.FC = () => {
  const [urls, setUrls] = useState<URLData[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadUrls = () => {
      const stored = sessionStorage.getItem('allUrls');
      if (stored) {
        const parsed = JSON.parse(stored) as URLData[];
        // Convert date strings back to Date objects
        const urlsWithDates = parsed.map(url => ({
          ...url,
          createdAt: new Date(url.createdAt),
          expiryDate: new Date(url.expiryDate)
        }));
        setUrls(urlsWithDates);
      }
    };

    loadUrls();
    // Refresh every 5 seconds to show updated click counts
    const interval = setInterval(loadUrls, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({ type: 'success', message: 'Copied to clipboard!' });
    setTimeout(() => setAlert(null), 3000);
  };

  const openOriginalUrl = (url: string) => {
    window.open(url, '_blank');
  };

  const deleteUrl = (shortcode: string) => {
    const updatedUrls = urls.filter(url => url.shortcode !== shortcode);
    setUrls(updatedUrls);
    sessionStorage.setItem('allUrls', JSON.stringify(updatedUrls));
    setAlert({ type: 'success', message: 'URL deleted successfully' });
    setTimeout(() => setAlert(null), 3000);
  };

  const isExpired = (expiryDate: Date): boolean => {
    return new Date() > expiryDate;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString();
  };

  const truncateUrl = (url: string, maxLength: number = 50): string => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          URL Statistics
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          All URLs created in your current session
        </Typography>
      </Box>

      {alert && (
        <Alert 
          severity={alert.type} 
          onClose={() => setAlert(null)} 
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {urls.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">
              No URLs created yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Create some shortened URLs to see statistics here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                URL Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total: {urls.length} URLs
              </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Shortcode</TableCell>
                    <TableCell align="center">Clicks</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.id} hover>
                      <TableCell>
                        <Tooltip title={url.originalUrl}>
                          <Typography variant="body2" sx={{ cursor: 'pointer' }}>
                            {truncateUrl(url.originalUrl)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontFamily="monospace">
                            {url.shortcode}
                          </Typography>
                          <Tooltip title="Copy short URL">
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(`${window.location.origin}/s/${url.shortcode}`)}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={url.clicks} 
                          size="small" 
                          color={url.clicks > 0 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.expiryDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={isExpired(url.expiryDate) ? 'Expired' : 'Active'} 
                          size="small" 
                          color={isExpired(url.expiryDate) ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Open original URL">
                            <IconButton 
                              size="small" 
                              onClick={() => openOriginalUrl(url.originalUrl)}
                              color="primary"
                            >
                              <LaunchIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete URL">
                            <IconButton 
                              size="small" 
                              onClick={() => deleteUrl(url.shortcode)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Note:</strong> Statistics are stored in your browser session and will be cleared when you close the browser.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Statistics;