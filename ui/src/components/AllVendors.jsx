import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ErrorCard from '../components/ErrorCard';
import { vendorAsyncActions } from '../redux/slices/vendorSlice';
import "../styles/AllVendors.scss";

const AllVendors = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { Vendors, isLoading, error } = useSelector(state => state.vendors);
  const userRole = useSelector(state => state.user.Role); 

  useEffect(() => {
    dispatch(vendorAsyncActions.getVendors({ requestData: "" }));
  }, [dispatch]);

  const toggleStatus = async (vendorId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await dispatch(vendorAsyncActions.updateVendor({ requestData: vendorId, data: { status: newStatus } }));
    dispatch(vendorAsyncActions.getVendors({ requestData: "" }));
  };

  if (isLoading && !Vendors) {
    return (
      <div className="container vendors">
        <p className="loading">Loading...</p>
      </div>
    );
  }

  if (error && !Vendors) {
    return (
      <div className="container vendors">
        <ErrorCard message={error} />
      </div>
    );
  }

  return (
    <div className="container vendors">
      {userRole != 'admin' && <h1>All Vendors</h1>}
      {Vendors && Vendors.length === 0 ? (
        <h1 className="message">No vendors available.</h1>
      ) : (
        <div className="vendor-cards">
          {Vendors.map(vendor => (
            <div key={vendor._id} className="vendor-card">
              <div className="vendor-header">
                <h2>
                  {vendor.status === 'active' && <span className="status-indicator"></span>}
                  {vendor.providerName}
                </h2>
                {userRole === 'admin' && (
                  <button onClick={() => toggleStatus(vendor._id, vendor.status)} className='btn'>
                    {vendor.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
              <div className="vendor-details">
                <p><strong>Provider ID:</strong> {vendor.providerId}</p>
                <p><strong>API Endpoint URL:</strong> {vendor.apiEndpointUrl}</p>
                <p><strong>Website:</strong> <a href={vendor.website}>{vendor.website}</a></p>
                <p><strong>Status:</strong> {vendor.status}</p>
                <p><strong>Start Date:</strong> {new Date(vendor.startDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllVendors;
