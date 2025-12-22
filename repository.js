
// Repository Pattern for Supabase Integration
// Handles data syncing between LocalStorage and Supabase

const REPO = {
    client: null,
    isConnected: false,

    init: function() {
        if (this.isConnected) return; // Already connected

        if (window.supabaseClient) {
            this.client = window.supabaseClient;
            this.isConnected = true;
            console.log('Repository: Supabase client initialized');
            this.syncAll();
        } else {
            console.warn('Repository: Supabase client not found yet. Waiting for event...');
            window.addEventListener('supabase-ready', () => {
                this.init();
            });
        }
    },

    // --- SYNC LOGIC ---
    // Reads from Supabase and updates LocalStorage
    // Then pushes any local changes (advanced: requires timestamps, simpler: just overwrite or merge)
    // For this prototype: Cloud is Truth. We pull from Cloud on load.
    
    syncAll: async function() {
        if (!this.isConnected) return;
        
        await this.syncProfile();
        await this.syncTable('apiaries', 'apiaries');
        await this.syncTable('hives', 'hives');
        await this.syncTable('inspections', 'inspections');
        
        // Dispatch event so UI can update
        window.dispatchEvent(new Event('data-synced'));
    },

    syncProfile: async function() {
        try {
            // 1. Get Cloud Profile
            const { data, error } = await this.client.from('profiles').select('*').single();
            
            // 2. Get Local Profile
            const localProfile = JSON.parse(localStorage.getItem('beekeeper') || 'null');

            if (data) {
                // Cloud has data -> Update Local
                localStorage.setItem('beekeeper', JSON.stringify(data));
                console.log('Synced Profile from cloud');
            } else {
                // Cloud is empty -> Push Local if exists
                if (localProfile) {
                    console.log('Pushing local profile to cloud...');
                    const { error: insertError } = await this.client
                        .from('profiles')
                        .insert(localProfile);
                    
                    if (insertError) {
                        console.error('Failed to push profile:', insertError);
                        alert(`Kunne ikke synkronisere profil til skyen: ${insertError.message}`);
                    } else {
                        console.log('Profile pushed to cloud');
                    }
                }
            }
        } catch (e) {
            // .single() throws if no rows, which is fine, we catch it here?
            // Actually Supabase JS .single() returns error code PGRST116 for no rows
            // It doesn't throw.
            // But let's be safe.
            console.log('Profile sync check:', e);
        }
    },

    // --- PROFILE / AUTH HELPER ---
    
    // Attempt to login against Supabase if local data is missing
    login: async function(email, pin) {
        if (!this.isConnected) return false;

        try {
            // 1. Check if user exists in cloud
            const { data, error } = await this.client
                .from('profiles')
                .select('*')
                .eq('email', email)
                .eq('pin', pin)
                .single();
            
            if (error || !data) {
                console.warn('Login failed:', error);
                return false;
            }

            // 2. Save user to local storage
            localStorage.setItem('beekeeper', JSON.stringify(data));
            console.log('Restored user profile from cloud:', data);

            // 3. Sync all other data (restore apiaries etc.)
            await this.syncAll();
            return true;

        } catch (e) {
            console.error('Login exception:', e);
            return false;
        }
    },

    saveProfile: async function(profile) {
        // 1. Save Local
        localStorage.setItem('beekeeper', JSON.stringify(profile));

        // 2. Save Cloud
        if (this.isConnected) {
            try {
                // Check if profile exists (by email) to avoid duplicates if ID is missing
                // But if we have ID, upsert is best.
                // Profile from register.html might not have UUID 'id'.
                // So we rely on email being unique-ish or just insert.
                // Better: Upsert on email? Or just insert and let RLS/constraints handle it?
                // For now: Upsert if we have ID, otherwise insert.
                
                // If the profile has no ID, we let Supabase generate it.
                // But then we need to get it back to update local.
                
                const { data, error } = await this.client
                    .from('profiles')
                    .upsert(profile, { onConflict: 'email' }) // Assuming email is unique key? Or just ID.
                    .select()
                    .single();
                    
                if (error) {
                    console.error('Profile save failed:', error);
                    alert('Kunne ikke lagre til skyen: ' + error.message + '\n\nDataene er lagret lokalt.');
                    // We do NOT throw here, we allow the local save to be "enough"
                } else if (data) {
                    // Update local with the server-generated ID
                    localStorage.setItem('beekeeper', JSON.stringify(data));
                }
            } catch (e) {
                console.error("Unexpected error in saveProfile:", e);
                alert("En uventet feil oppstod under lagring til skyen. Data er lagret lokalt.");
            }
        }
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
                    // We simply map items. We MUST include the ID.
                    const { error } = await this.client.from(tableName).insert(localData);
                    
                    if (error) {
                        console.error(`Failed to push ${tableName}:`, error);
                        alert(`Kunne ikke synkronisere ${tableName} til skyen: ${error.message}`);
                    } else {
                        console.log(`Pushed ${tableName} to cloud`);
                    }
                }
            }
        } catch (e) {
            console.error(`Sync error for ${tableName}:`, e);
            // alert(`Sync error: ${e.message}`); // Optional: don't spam user on network error
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

// Auto-init if loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    REPO.init();
} else {
    document.addEventListener('DOMContentLoaded', () => REPO.init());
}
