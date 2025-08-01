// Hamburger menu functionality
        document.addEventListener('DOMContentLoaded', function() {
            const hamburger = document.querySelector('.hamburger');
            const navLinks = document.querySelector('.nav-links');
            
            hamburger.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });

            // Dropdown functionality
            const dropdowns = document.querySelectorAll('.dropdown');
            const selectedFilters = document.getElementById('selectedFilters');
            let filters = {};

            dropdowns.forEach(dropdown => {
                const btn = dropdown.querySelector('.dropdown-btn');
                const content = dropdown.querySelector('.dropdown-content');
                const options = dropdown.querySelectorAll('.dropdown-option');

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Close other dropdowns
                    dropdowns.forEach(d => {
                        if(d !== dropdown) d.classList.remove('active');
                    });
                    
                    dropdown.classList.toggle('active');
                });

                options.forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        
                        const value = option.dataset.value;
                        const text = option.textContent;
                        const dropdownId = dropdown.id;
                        
                        // Update button text
                        btn.querySelector('span').textContent = text;
                        
                        // Update selected option
                        options.forEach(opt => opt.classList.remove('selected'));
                        option.classList.add('selected');
                        
                        // Store filter
                        filters[dropdownId] = { value, text };
                        
                        dropdown.classList.remove('active');
                        updateSelectedFilters();
                    });
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', () => {
                dropdowns.forEach(d => d.classList.remove('active'));
            });

            // Update selected filters display
            function updateSelectedFilters() {
                selectedFilters.innerHTML = '';
                
                Object.keys(filters).forEach(key => {
                    if(filters[key]) {
                        const tag = document.createElement('div');
                        tag.className = 'filter-tag';
                        tag.innerHTML = `
                            <span>${filters[key].text}</span>
                            <div class="remove" data-filter="${key}">×</div>
                        `;
                        selectedFilters.appendChild(tag);
                    }
                });

                // Add remove functionality
                selectedFilters.querySelectorAll('.remove').forEach(remove => {
                    remove.addEventListener('click', (e) => {
                        const filterKey = e.target.dataset.filter;
                        delete filters[filterKey];
                        
                        // Reset dropdown
                        const dropdown = document.getElementById(filterKey);
                        const btn = dropdown.querySelector('.dropdown-btn span');
                        const options = dropdown.querySelectorAll('.dropdown-option');
                        
                        btn.textContent = getDefaultText(filterKey);
                        options.forEach(opt => opt.classList.remove('selected'));
                        
                        updateSelectedFilters();
                    });
                });
            }

            function getDefaultText(filterKey) {
                const defaults = {
                    'flatType': 'Select Type',
                    'nearbyRange': 'Select Range',
                    'priceRange': 'Select Budget'
                };
                return defaults[filterKey] || 'Select';
            }

            // Search form submission
            document.querySelector('.search-form').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const location = document.getElementById('location').value;
                const searchData = {
                    location: location,
                    ...filters
                };
                
                console.log('Search Data:', searchData);
                alert('Search functionality will be implemented here!\nCheck console for search data.');
            });
        });