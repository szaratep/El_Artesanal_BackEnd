import productService from '../service/product.service.js';

// ─── GET ALL ───────────────────────────────────────────────────────────────────
export const getAll = async (req, res) => {
    try {
        const data = await productService.getAll();

        return res.status(200).json({
            ok:      true,
            message: 'Productos obtenidos correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener los productos',
            error:   error.message
        });
    }
};

// ─── GET FEATURED ─────────────────────────────────────────────────────────────
export const getFeatured = async (req, res) => {
    try {
        const data = await productService.getFeatured();

        return res.status(200).json({
            ok:      true,
            message: 'Productos destacados obtenidos correctamente',
            data
        });
    } catch (error) {
        return res.status(500).json({
            ok:      false,
            message: 'Error al obtener los productos destacados',
            error:   error.message
        });
    }
};

// ─── GET BY ID ─────────────────────────────────────────────────────────────────
export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await productService.getById(id);

        return res.status(200).json({
            ok:      true,
            message: 'Producto obtenido correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── GET BY SKU ────────────────────────────────────────────────────────────────
export const getBySku = async (req, res) => {
    try {
        const { sku } = req.params;
        const data    = await productService.getBySku(sku);

        return res.status(200).json({
            ok:      true,
            message: 'Producto obtenido correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── RESOLVE PRICE ────────────────────────────────────────────────────────────
export const resolvePrice = async (req, res) => {
    try {
        const { id }       = req.params;
        const { quantity } = req.query;

        if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 1) {
            return res.status(400).json({
                ok:      false,
                message: 'El parámetro quantity debe ser un número mayor o igual a 1',
                error:   'El parámetro quantity debe ser un número mayor o igual a 1'
            });
        }

        const product    = await productService.getById(id);
        const priceData  = productService.resolvePrice(product, Number(quantity));

        return res.status(200).json({
            ok:      true,
            message: 'Precio resuelto correctamente',
            data:    priceData
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        return res.status(isNotFound ? 404 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── CREATE ────────────────────────────────────────────────────────────────────
export const create = async (req, res) => {
    try {
        const data = await productService.create(req.body);

        return res.status(201).json({
            ok:      true,
            message: 'Producto creado correctamente',
            data
        });
    } catch (error) {
        const isConflict   = error.message.includes('Ya existe');
        const isNotFound   = error.message.includes('no existe') ||
                             error.message.includes('no encontrada');
        const isBusiness   = error.message.includes('debe ser menor') ||
                             error.message.includes('desactivada');
        const isValidation = error.name === 'ValidationError';

        return res.status(
            isConflict   ? 409 :
            isNotFound   ? 404 :
            isBusiness   ? 422 :
            isValidation ? 422 : 500
        ).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── UPDATE ────────────────────────────────────────────────────────────────────
export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await productService.update(id, req.body);

        return res.status(200).json({
            ok:      true,
            message: 'Producto actualizado correctamente',
            data
        });
    } catch (error) {
        const isNotFound   = error.message.includes('no encontrado') ||
                             error.message.includes('no existe');
        const isConflict   = error.message.includes('Ya existe');
        const isBusiness   = error.message.includes('debe ser menor') ||
                             error.message.includes('desactivada');
        const isValidation = error.name === 'ValidationError';

        return res.status(
            isNotFound   ? 404 :
            isConflict   ? 409 :
            isBusiness   ? 422 :
            isValidation ? 422 : 500
        ).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── UPDATE STOCK ─────────────────────────────────────────────────────────────
export const updateStock = async (req, res) => {
    try {
        const { id }       = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo quantity es obligatorio',
                error:   'El campo quantity es obligatorio'
            });
        }

        if (isNaN(Number(quantity))) {
            return res.status(400).json({
                ok:      false,
                message: 'El campo quantity debe ser un número',
                error:   'El campo quantity debe ser un número'
            });
        }

        const data = await productService.updateStock(id, Number(quantity));

        return res.status(200).json({
            ok:      true,
            message: 'Stock actualizado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isBusiness = error.message.includes('no puede quedar en negativo');

        return res.status(isNotFound ? 404 : isBusiness ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── TOGGLE FEATURED ──────────────────────────────────────────────────────────
export const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await productService.toggleFeatured(id);

        return res.status(200).json({
            ok:      true,
            message: `Producto ${data.isFeatured ? 'marcado como destacado' : 'desmarcado como destacado'} correctamente`,
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isBusiness = error.message.includes('No se puede destacar');

        return res.status(isNotFound ? 404 : isBusiness ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── SOFT DELETE ──────────────────────────────────────────────────────────────
export const softDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await productService.softDelete(id);

        return res.status(200).json({
            ok:      true,
            message: 'Producto desactivado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isConflict = error.message.includes('ya se encuentra');

        return res.status(isNotFound ? 404 : isConflict ? 409 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};

// ─── RESTORE ──────────────────────────────────────────────────────────────────
export const restore = async (req, res) => {
    try {
        const { id } = req.params;
        const data   = await productService.restore(id);

        return res.status(200).json({
            ok:      true,
            message: 'Producto restaurado correctamente',
            data
        });
    } catch (error) {
        const isNotFound = error.message.includes('no encontrado');
        const isConflict = error.message.includes('ya se encuentra');
        const isBusiness = error.message.includes('categoría está desactivada');

        return res.status(isNotFound ? 404 : isConflict ? 409 : isBusiness ? 422 : 500).json({
            ok:      false,
            message: error.message,
            error:   error.message
        });
    }
};