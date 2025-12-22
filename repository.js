
// Repository Pattern for Supabase Integration
// Handles data syncing between LocalStorage and Supabase

const REPO = {
    client: null,
    isConnected: false,

    init: function() {
        if (window.supabaseClient) {
            this.client = window.supabaseClient;
            this.isConnected = true;
            console.log('Repository: Supabase client initialized');
            this.syncAll();
        } else {
            console.warn('Repository: Supabase client not found');
        }
    },

    // --- SYNC LOGIC ---
    // Reads from Supabase and updates LocalStorage
    // Then pushes any local changes (advanced: requires timestamps, simpler: just overwrite or merge)
    // For this prototype: Cloud is Truth. We pull from Cloud on load.
    
    syncAll: async function() {
        if (!this.isConnected) return;
        
        await this.syncTable('apiaries', 'apiaries');
        await this.syncTable('hives', 'hives');
        await this.syncTable('inspections', 'inspections');
        
        // Dispatch event so UI can update
        window.dispatchEvent(new Event('data-synced'));
    },

    syncTable: async function(tableName, localKey) {
        try {
            const { data, error } = await this.client.from(tableName).select('*');
            if (error) throw error;

            if (data && data.length > 0) {
                // Map Supabase data back to App format if needed
                // For now, we assume direct mapping
                localStorage.setItem(localKey, JSON.stringify(data));
                console.log(`Synced ${tableName}:`, data.length, 'records');
            } else {
                // If cloud is empty, maybe push local data?
                // This is useful for first-time sync
                const localData = JSON.parse(localStorage.getItem(localKey) || '[]');
                if (localData.length > 0) {
                    console.log(`Pushing local ${tableName} to cloud...`);
                    await this.client.from(tableName).insert(localData.map(item => {
                        // Ensure no internal local IDs conflict with UUIDs if possible, 
                        // or just let Supabase generate IDs if missing
                        const { id, ...rest } = item; 
                        // If ID is numeric (local), remove it to let Supabase gen UUID
                        // If ID is UUID, keep it.
                        if (typeof id === 'number') return rest;
                        return item;
                    }));
                }
            }
        } catch (e) {
            console.error(`Sync error for ${tableName}:`, e);
        }
    },

    // --- CRUD OPERATIONS ---
    // Use these instead of direct localStorage manipulation

    save: async function(key, data) {
        // 1. Save to LocalStorage (Optimistic)
        localStorage.setItem(key, JSON.stringify(data));

        // 2. Push to Supabase
        if (this.isConnected) {
            // This is a "overwrite" strategy - simplistic but works for single user
            // Better: Upsert individual items
            // But 'data' here is the WHOLE array.
            // We need to find what changed.
            // For MVP: We'll just re-sync or push the new items.
            // Actually, pushing the whole array is bad.
            
            // Let's implement specific savers
        }
    },

    // Specialized savers
    addApiary: async function(apiary) {
        // Local
        const list = JSON.parse(localStorage.getItem('apiaries') || '[]');
        list.push(apiary);
        localStorage.setItem('apiaries', JSON.stringify(list));
        
        // Cloud
        if (this.isConnected) {
            const { error } = await this.client.from('apiaries').insert(apiary);
            if (error) console.error('Cloud save failed:', error);
        }
    },

    addHive: async function(hive) {
        const list = JSON.parse(localStorage.getItem('hives') || '[]');
        list.push(hive);
        localStorage.setItem('hives', JSON.stringify(list));

        if (this.isConnected) {
            const { error } = await this.client.from('hives').insert(hive);
            if (error) console.error('Cloud save failed:', error);
        }
    },
    
    updateHive: async function(updatedHive) {
         // Local
        let list = JSON.parse(localStorage.getItem('hives') || '[]');
        const index = list.findIndex(h => h.id === updatedHive.id);
        if (index !== -1) {
            list[index] = updatedHive;
            localStorage.setItem('hives', JSON.stringify(list));
        }

        // Cloud (Upsert)
        if (this.isConnected) {
            const { error } = await this.client.from('hives').upsert(updatedHive);
            if (error) console.error('Cloud update failed:', error);
        }
    },

    deleteApiary: async function(id) {
         // Local
        let list = JSON.parse(localStorage.getItem('apiaries') || '[]');
        list = list.filter(a => a.id !== id);
        localStorage.setItem('apiaries', JSON.stringify(list));

        // Cloud
        if (this.isConnected) {
            const { error } = await this.client.from('apiaries').delete().eq('id', id);
            if (error) console.error('Cloud delete failed:', error);
        }
    },

    deleteHive: async function(id) {
        let list = JSON.parse(localStorage.getItem('hives') || '[]');
        list = list.filter(h => h.id !== id);
        localStorage.setItem('hives', JSON.stringify(list));

        if (this.isConnected) {
            const { error } = await this.client.from('hives').delete().eq('id', id);
            if (error) console.error('Cloud delete failed:', error);
        }
    },

    addInspection: async function(inspection) {
        const list = JSON.parse(localStorage.getItem('inspections') || '[]');
        list.push(inspection);
        localStorage.setItem('inspections', JSON.stringify(list));

        if (this.isConnected) {
            const { error } = await this.client.from('inspections').insert(inspection);
            if (error) console.error('Cloud save failed:', error);
        }
    }
};

// Expose globally
window.REPO = REPO;
