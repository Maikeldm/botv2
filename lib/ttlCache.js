// lib/ttlCache.js

/**
 * Un cache simple en memoria con "Time To Live" (TTL).
 * Guarda datos por un tiempo limitado.
 */
class TtlCache {
    /**
     * @param {number} ttlSeconds El tiempo en segundos que vive cada entrada.
     */
    constructor(ttlSeconds) {
        this.cache = new Map();
        this.ttl = ttlSeconds * 1000; // Convertir a milisegundos
        // Opcional: Limpiador automático para entradas muy viejas
        setInterval(() => this.cleanExpired(), this.ttl * 2);
    }

    /**
     * Obtiene un valor del cache.
     * Devuelve 'null' si no existe o si ha expirado.
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null; // Cache miss

        // Comprobar si expiró
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key); // Cache expirado
            return null;
        }
        
        return entry.value; // Cache hit
    }

    /**
     * Guarda un valor en el cache.
     */
    set(key, value) {
        this.cache.set(key, {
            value: value,
            timestamp: Date.now()
        });
    }
    
    /**
     * Invalida (borra) una clave específica del cache.
     * @param {string} key La clave (nro de WA) a borrar.
     * @returns {boolean} True si algo se borró, false si no.
     */
    invalidate(key) {
        const deleted = this.cache.delete(key);
        return deleted;
    }

    // Limpia entradas expiradas (mantenimiento)
    cleanExpired() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
                this.cache.delete(key);
            }
        }
    }
}

module.exports = TtlCache;