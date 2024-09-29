import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import '../styles/DIDsPricing.scss'; // Import the SCSS file

const DIDsPricing = () => {
    const dispatch = useDispatch();
    const { globalPricing, loading, error } = useSelector((state) => state.did); // Get DID pricing state
    const userRole = useSelector((state) => state.user.Role); // Get user role from state

    const [nonBulkPrice, setNonBulkPrice] = useState(globalPricing?.nonBulkPrice || '');
    const [bulkPrice, setBulkPrice] = useState(globalPricing?.bulkPrice || '');
    const [bulkThreshold, setBulkThreshold] = useState(globalPricing?.bulkThreshold || '');

    useEffect(() => {
        dispatch(didAsyncActions.fetchGlobalDIDPricing({ requestData: '' }));
    }, [dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedPricing = {
            nonBulkPrice,
            bulkPrice,
            bulkThreshold,
        };
        dispatch(didAsyncActions.setGlobalDIDPricing({ data: updatedPricing }));
    };

    return (
        <div className="dids-pricing">
            <h2>Global DID Pricing</h2>
            {loading ? (
                <p>Loading pricing...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div className="pricing-info">
                    <p><strong>Non-Bulk Price:</strong> ${globalPricing?.nonBulkPrice}</p>
                    <p><strong>Bulk Price:</strong> ${globalPricing?.bulkPrice}</p>
                    <p><strong>Bulk Threshold:</strong> {globalPricing?.bulkThreshold} DIDs</p>
                </div>
            )}

            {userRole === 'admin' && (
                <div className="update-pricing">
                    <h3>Update Global Pricing</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Non-Bulk Price</label>
                            <input
                                type="number"
                                value={nonBulkPrice}
                                onChange={(e) => setNonBulkPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Bulk Price</label>
                            <input
                                type="number"
                                value={bulkPrice}
                                onChange={(e) => setBulkPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Bulk Threshold</label>
                            <input
                                type="number"
                                value={bulkThreshold}
                                onChange={(e) => setBulkThreshold(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Update Pricing</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DIDsPricing;
