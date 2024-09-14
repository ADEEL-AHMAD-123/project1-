import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { didAsyncActions } from '../redux/slices/didSlice';
import '../styles/AddDIDs.scss'
const AddDIDs = () => {
    const dispatch = useDispatch();
    const [didNumber, setDidNumber] = useState('');
    const [country, setCountry] = useState('');
    const [areaCode, setAreaCode] = useState('');
    const [price, setPrice] = useState('');

    const handleAddDID = () => {
        dispatch(didAsyncActions.addDID({ didNumber, country, areaCode, price }));
        setDidNumber('');
        setCountry('');
        setAreaCode('');
        setPrice('');
    };

    return (
        <div className="add-dids">
            <h2>Add New DID</h2>
            <div className="form-group">
                <input
                    type="text"
                    placeholder="DID Number"
                    value={didNumber}
                    onChange={(e) => setDidNumber(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Area Code"
                    value={areaCode}
                    onChange={(e) => setAreaCode(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />
                <button onClick={handleAddDID}>Add DID</button>
            </div>
        </div>
    );
};

export default AddDIDs;
