# 811 Integration API Web Interface

A simple, modern web interface for testing the 811 Integration API endpoints.

## Features

- **Modern UI**: Clean, responsive design with gradient backgrounds and smooth animations
- **Tabbed Interface**: Organized into logical sections for different API operations
- **Real-time Health Check**: Shows API status with visual indicators
- **Form Validation**: Client-side validation for required fields
- **Response Display**: Formatted JSON responses with syntax highlighting
- **Error Handling**: Clear error messages and visual feedback

## Getting Started

1. **Start the API server**:
   ```bash
   npm run dev
   ```

2. **Access the web interface**:
   Open your browser and navigate to `http://localhost:3000`

## Interface Sections

### 1. Create Request
- Fill out the form to create a new 811 request
- Required fields: Requestor Name, Phone, Email, District, Work Description, Dates, Location
- Automatically sets today and tomorrow as default start/end dates

### 2. Search Requests
- Search existing requests by various criteria
- Filter by requestor name, status, and date range
- Returns matching requests in JSON format

### 3. Check Status
- Enter a request ID to check its current status
- Displays detailed request information

### 4. Manage Requests
- Cancel or retry requests by entering the request ID
- Useful for handling failed or pending requests

## API Endpoints Used

The web interface interacts with these API endpoints:

- `POST /api/requests` - Create new request
- `GET /api/requests` - Search requests
- `GET /api/requests/:id` - Get specific request
- `POST /api/requests/:id/cancel` - Cancel request
- `POST /api/requests/:id/retry` - Retry request
- `GET /health` - Health check

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **API Communication**: Fetch API with proper error handling
- **Static Serving**: Express.js serves static files from `/public` directory

## Browser Compatibility

Works with all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Fetch API
- CSS animations and gradients

## Customization

The interface can be easily customized by modifying:
- `public/index.html` - HTML structure and JavaScript
- CSS styles in the `<style>` section
- API endpoint URLs in the JavaScript constants

## Troubleshooting

1. **API not responding**: Check that the server is running on port 3000
2. **CORS errors**: Ensure the API server has CORS enabled
3. **Authentication issues**: The interface assumes no authentication is required for testing
4. **Network errors**: Check browser console for detailed error messages

## Development

To modify the interface:
1. Edit `public/index.html`
2. Refresh the browser to see changes
3. No build process required - it's pure HTML/CSS/JS