import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import '../styles/MyDIDs.scss'

const MyDIDs = () => {
    const dispatch = useDispatch();
    const { purchasedDIDs, isLoading, error } = useSelector((state) => state.did);

    useEffect(() => {
        dispatch(didAsyncActions.fetchPurchasedDIDs());
    }, [dispatch]);

    if (isLoading) return <p>Loading DIDs...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="my-dids">
            <h2>My DIDs</h2>
            <ul className="did-list">
                {purchasedDIDs.map((did) => (
                    <li key={did._id}>
                        {did.didNumber} ({did.country} - {did.areaCode}) - ${did.price}
                        <button className="config-btn">Update Config</button>
                        <button className="delete-btn">Schedule Deletion</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyDIDs;
