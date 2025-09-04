import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon,
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

interface URLInputRow {
  id: string;
  originalUrl: string;
  validityMinutes: number;
  customShortcode: string;
  error: string;
}

const URLShortener: React.FC = () => {
  const [urlRows, setUrlRows] = useState<URLInputRow[]>([
    { id: '1', originalUrl: '', validityMinutes: 30, customShortcode: '', error: '' }
  ]);
  const [shortenedUrls, setShortenedUrls] = useState<URLData[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Simple logging middleware
  const log = useCallback((action: string, data?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      data
    };
    // Store in sessionStorage for simple logging
    const logs = JSON.parse(sessionStorage.getItem('urlShortenerLogs') || '[]');
    logs.push(logEntry);
    sessionStorage.setItem('urlShortenerLogs', JSON.stringify(logs));
  }, []);

  const generateShortcode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isUniqueShortcode = (shortcode: string, excludeId?: string): boolean => {
    const existing = JSON.parse(sessionStorage.getItem('allUrls') || '[]') as URLData[];
    return !existing.some(url => url.shortcode === shortcode && url.id !== excludeId);
  };

  const validateRow = (row: URLInputRow): string => {
    if (!row.originalUrl.trim()) return 'URL is required';
    if (!isValidUrl(row.originalUrl)) return 'Invalid URL format';
    if (row.validityMinutes <= 0) return 'Validity must be positive';
    if (row.customShortcode && !isUniqueShortcode(row.customShortcode, row.id)) {
      return 'Shortcode already exists';
    }
    if (row.customShortcode && !/^[a-zA-Z0-9]+$/.test(row.customShortcode)) {
      return 'Shortcode must be alphanumeric';
    }
    return '';
  };

  const addUrlRow = () => {
    if (urlRows.length < 5) {
      setUrlRows([...urlRows, {
        id: Date.now().toString(),
        originalUrl: '',
        validityMinutes: 30,
        customShortcode: '',
        error: ''
      }]);
      log('ADD_URL_ROW');
    }
  };

  const removeUrlRow = (id: string) => {
    setUrlRows(urlRows.filter(row => row.id !== id));
    log('REMOVE_URL_ROW', { id });
  };

  const updateUrlRow = (id: string, field: keyof URLInputRow, value: string | number) => {
    setUrlRows(urlRows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value };
        updated.error = validateRow(updated);
        return updated;
      }
      return row;
    }));
  };

  const shortenUrls = () => {
    const validRows = urlRows.filter(row => !validateRow(row) && row.originalUrl.trim());
    
    if (validRows.length === 0) {
      setAlert({ type: 'error', message: 'Please enter at least one valid URL' });
      return;
    }

    const newUrls: URLData[] = validRows.map(row => {
      const shortcode = row.customShortcode || generateShortcode();
      const createdAt = new Date();
      const expiryDate = new Date(createdAt.getTime() + row.validityMinutes * 60000);
      
      return {
        id: row.id,
        originalUrl: row.originalUrl,
        shortcode,
        validityMinutes: row.validityMinutes,
        createdAt,
        expiryDate,
        clicks: 0
      };
    });

    // Store in sessionStorage
    const allUrls = JSON.parse(sessionStorage.getItem('allUrls') || '[]') as URLData[];
    const updatedUrls = [...allUrls, ...newUrls];
    sessionStorage.setItem('allUrls', JSON.stringify(updatedUrls));

    setShortenedUrls(newUrls);
    setAlert({ type: 'success', message: `Successfully shortened ${newUrls.length} URL(s)` });
    log('SHORTEN_URLS', { count: newUrls.length });

    // Reset form
    setUrlRows([{ id: Date.now().toString(), originalUrl: '', validityMinutes: 30, customShortcode: '', error: '' }]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setAlert({ type: 'success', message: 'Copied to clipboard!' });
  };

  const handleShortUrlClick = (shortcode: string) => {
    const allUrls = JSON.parse(sessionStorage.getItem('allUrls') || '[]') as URLData[];
    const url = allUrls.find(u => u.shortcode === shortcode);
    
    if (!url) {
      setAlert({ type: 'error', message: 'Short URL not found' });
      return;
    }

    if (new Date() > new Date(url.expiryDate)) {
      setAlert({ type: 'error', message: 'This link has expired' });
      return;
    }

    // Increment click count
    url.clicks++;
    const updatedUrls = allUrls.map(u => u.shortcode === shortcode ? url : u);
    sessionStorage.setItem('allUrls', JSON.stringify(updatedUrls));
    
    log('REDIRECT', { shortcode, originalUrl: url.originalUrl });
    window.open(url.originalUrl, '_blank');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          URL Shortener
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Shorten up to 5 URLs at once with custom expiry times
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

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Enter URLs to Shorten
          </Typography>
          
          {urlRows.map((row, index) => (
            <Box key={row.id} sx={{ mb: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="Original URL"
                  placeholder="https://example.com"
                  value={row.originalUrl}
                  onChange={(e) => updateUrlRow(row.id, 'originalUrl', e.target.value)}
                  error={!!row.error}
                  helperText={row.error}
                  size="small"
                  sx={{ flex: 2, minWidth: 200 }}
                />
                <TextField
                  label="Validity (min)"
                  type="number"
                  value={row.validityMinutes}
                  onChange={(e) => updateUrlRow(row.id, 'validityMinutes', parseInt(e.target.value) || 30)}
                  size="small"
                  inputProps={{ min: 1 }}
                  sx={{ flex: 0.5, minWidth: 120 }}
                />
                <TextField
                  label="Custom Shortcode"
                  placeholder="abc123"
                  value={row.customShortcode}
                  onChange={(e) => updateUrlRow(row.id, 'customShortcode', e.target.value)}
                  size="small"
                  sx={{ flex: 1, minWidth: 140 }}
                />
                {urlRows.length > 1 && (
                  <IconButton onClick={() => removeUrlRow(row.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
              {index < urlRows.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {urlRows.length < 5 && (
              <Button
                startIcon={<AddIcon />}
                onClick={addUrlRow}
                variant="outlined"
              >
                Add URL
              </Button>
            )}
            <Button
              variant="contained"
              onClick={shortenUrls}
              disabled={urlRows.every(row => !row.originalUrl.trim() || !!validateRow(row))}
            >
              Shorten URLs
            </Button>
          </Box>
        </CardContent>
      </Card>

      {shortenedUrls.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shortened URLs
            </Typography>
            {shortenedUrls.map((url) => (
              <Box key={url.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LinkIcon color="primary" />
                  <Typography 
                    variant="body2" 
                    sx={{ cursor: 'pointer', color: 'primary.main', textDecoration: 'underline' }}
                    onClick={() => handleShortUrlClick(url.shortcode)}
                  >
                    {window.location.origin}/s/{url.shortcode}
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton size="small" onClick={() => copyToClipboard(`${window.location.origin}/s/${url.shortcode}`)}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Original: {url.originalUrl}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip 
                    label={`Expires: ${url.expiryDate.toLocaleString()}`} 
                    size="small" 
                    color="secondary"
                  />
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default URLShortener;