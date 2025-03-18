import React from 'react';

const Logo = ({ width = '100px', height = '100px' }) => {
  // Using a simple placeholder logo until you have a real one
  return (
    <img 
      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMzZjUxYjUiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNmZmZmZmYiPkFJLUJhbms8L3RleHQ+PC9zdmc+"
      alt="Bank Logo"
      style={{ width, height }}
    />
  );
};

export default Logo;