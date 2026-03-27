// Favorites Manager for Weather Maps
class FavoritesManager {
  constructor() {
    this.maxFavorites = 10;
    this.storageKey = 'weatherMapsFavorites';
    this.favorites = this.loadFavorites();
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderFavorites();
  }

  bindEvents() {
    // Save favorite button
    const saveFavoriteBtn = document.getElementById('saveFavorite');
    if (saveFavoriteBtn) {
      saveFavoriteBtn.addEventListener('click', () => this.saveFavorite());
    }

    // Export favorites button
    const exportBtn = document.getElementById('exportFavorites');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportFavorites());
    }

    // Import favorites button
    const importBtn = document.getElementById('importFavorites');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.importFavorites());
    }

    // File input for import
    const fileInput = document.getElementById('importFile');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileImport(e));
    }
  }

  loadFavorites() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  saveFavoritesToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
      this.showMessage('Error saving favorites', 'error');
    }
  }

  saveFavorite() {
    const city = document.getElementById('city').value.trim();
    const lat = parseFloat(document.getElementById('latitude').value);
    const lon = parseFloat(document.getElementById('longitude').value);

    if (!lat || !lon) {
      this.showMessage('Please enter valid coordinates', 'error');
      return;
    }

    if (this.favorites.length >= this.maxFavorites) {
      this.showMessage(`Maximum ${this.maxFavorites} favorite locations allowed`, 'error');
      return;
    }

    // Check if location already exists
    const exists = this.favorites.some(fav => 
      Math.abs(fav.latitude - lat) < 0.001 && Math.abs(fav.longitude - lon) < 0.001
    );

    if (exists) {
      this.showMessage('Location already in favorites', 'error');
      return;
    }

    const favorite = {
      id: this.generateId(),
      name: city || `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
      latitude: lat,
      longitude: lon,
      country: '', // Could be enhanced with reverse geocoding
      dateAdded: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    this.favorites.push(favorite);
    this.saveFavoritesToStorage();
    this.renderFavorites();
    this.showMessage('Location saved to favorites', 'success');
  }

  loadFavorite(id) {
    const favorite = this.favorites.find(fav => fav.id === id);
    if (!favorite) return;

    // Update form fields
    document.getElementById('city').value = favorite.name;
    document.getElementById('latitude').value = favorite.latitude;
    document.getElementById('longitude').value = favorite.longitude;

    // Update last used timestamp
    favorite.lastUsed = new Date().toISOString();
    this.saveFavoritesToStorage();

    // Load the map
    const layer = document.getElementById('weatherLayer').value;
    updateMap(favorite.latitude, favorite.longitude, layer);

    // Update selected city display
    const selectedLocationText = (typeof _t === 'function') ? _t('selectedLocation') : 'Selected location';
    document.getElementById('selected-city').textContent = `${selectedLocationText}: ${favorite.name}`;

    this.showMessage('Favorite location loaded', 'success');
  }

  deleteFavorite(id) {
    if (confirm('Are you sure you want to delete this favorite location?')) {
      this.favorites = this.favorites.filter(fav => fav.id !== id);
      this.saveFavoritesToStorage();
      this.renderFavorites();
      this.showMessage('Favorite location deleted', 'success');
    }
  }

  exportFavorites() {
    if (this.favorites.length === 0) {
      this.showMessage('No favorites to export', 'error');
      return;
    }

    const dataStr = JSON.stringify(this.favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `weather-maps-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showMessage('Favorites exported successfully', 'success');
  }

  importFavorites() {
    const fileInput = document.getElementById('importFile');
    if (fileInput) {
      fileInput.click();
    }
  }

  handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedFavorites = JSON.parse(e.target.result);
        
        if (!Array.isArray(importedFavorites)) {
          throw new Error('Invalid file format');
        }

        // Validate imported data
        const validFavorites = importedFavorites.filter(fav => 
          fav.id && fav.name && typeof fav.latitude === 'number' && typeof fav.longitude === 'number'
        );

        if (validFavorites.length === 0) {
          this.showMessage('No valid favorites found in file', 'error');
          return;
        }

        // Merge with existing favorites (avoid duplicates)
        let addedCount = 0;
        validFavorites.forEach(importedFav => {
          const exists = this.favorites.some(fav => 
            Math.abs(fav.latitude - importedFav.latitude) < 0.001 && 
            Math.abs(fav.longitude - importedFav.longitude) < 0.001
          );

          if (!exists && this.favorites.length < this.maxFavorites) {
            // Ensure unique ID
            importedFav.id = this.generateId();
            importedFav.dateAdded = importedFav.dateAdded || new Date().toISOString();
            importedFav.lastUsed = importedFav.lastUsed || new Date().toISOString();
            
            this.favorites.push(importedFav);
            addedCount++;
          }
        });

        this.saveFavoritesToStorage();
        this.renderFavorites();
        
        if (addedCount > 0) {
          this.showMessage(`${addedCount} favorite(s) imported successfully`, 'success');
        } else {
          this.showMessage('No new favorites were imported (duplicates or limit reached)', 'error');
        }

      } catch (error) {
        console.error('Import error:', error);
        this.showMessage('Error importing favorites: Invalid file format', 'error');
      }
    };

    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  }

  renderFavorites() {
    const favoritesList = document.getElementById('favoritesList');
    if (!favoritesList) return;

    if (this.favorites.length === 0) {
      favoritesList.className = 'favorites-list empty';
      favoritesList.innerHTML = '<div>No favorite locations saved yet</div>';
      return;
    }

    favoritesList.className = 'favorites-list';
    
    // Sort favorites by last used (most recent first)
    const sortedFavorites = [...this.favorites].sort((a, b) => 
      new Date(b.lastUsed) - new Date(a.lastUsed)
    );

    favoritesList.innerHTML = sortedFavorites.map(favorite => `
      <div class="favorite-item" data-id="${favorite.id}">
        <div class="favorite-content" onclick="favoritesManager.loadFavorite('${favorite.id}')">
          <div class="favorite-name">${this.escapeHtml(favorite.name)}</div>
          <div class="favorite-coords">${favorite.latitude.toFixed(4)}, ${favorite.longitude.toFixed(4)}</div>
        </div>
        <div class="favorite-actions">
          <button class="favorite-load" onclick="favoritesManager.loadFavorite('${favorite.id}')" title="Load location">
            📍
          </button>
          <button class="favorite-delete" onclick="favoritesManager.deleteFavorite('${favorite.id}')" title="Delete favorite">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
  }

  generateId() {
    return 'fav_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showMessage(text, type = 'success') {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;

    // Insert after form container
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
      formContainer.insertAdjacentElement('afterend', message);
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 3000);
  }

  // Get favorites count for external use
  getFavoritesCount() {
    return this.favorites.length;
  }

  // Get all favorites for external use
  getAllFavorites() {
    return [...this.favorites];
  }

  // Clear all favorites (for testing/admin purposes)
  clearAllFavorites() {
    if (confirm('Are you sure you want to delete ALL favorite locations? This cannot be undone.')) {
      this.favorites = [];
      this.saveFavoritesToStorage();
      this.renderFavorites();
      this.showMessage('All favorites cleared', 'success');
    }
  }
}

// Initialize favorites manager when DOM is loaded
let favoritesManager;

document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit to ensure other scripts are loaded
  setTimeout(() => {
    favoritesManager = new FavoritesManager();
    
    // Add clear all button for development (can be removed in production)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const favoritesHeader = document.querySelector('.favorites-header');
      if (favoritesHeader) {
        const clearAllBtn = document.createElement('button');
        clearAllBtn.textContent = '🗑️ Clear All';
        clearAllBtn.className = 'btn';
        clearAllBtn.style.fontSize = '0.8em';
        clearAllBtn.style.padding = '6px 12px';
        clearAllBtn.style.backgroundColor = '#ff6b6b';
        clearAllBtn.onclick = () => favoritesManager.clearAllFavorites();
        
        const buttonsDiv = favoritesHeader.querySelector('.favorites-buttons') || 
                          favoritesHeader.querySelector('div:last-child');
        if (buttonsDiv) {
          buttonsDiv.appendChild(clearAllBtn);
        }
      }
    }
  }, 500);
});

// Export for global access
window.favoritesManager = favoritesManager;