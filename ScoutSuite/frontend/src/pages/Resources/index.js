import { useParams } from 'react-router-dom';
import React from 'react';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';

import { useAPI } from '../../api/useAPI';
import { sortBySeverity } from '../../utils/Severity/sort';
import Table from '../../components/Table';
import Name from './formatters/Name/index';
import ResourcePartialWrapper from './ResourcePartialWrapper';
import Breadcrumb from '../../components/Breadcrumb/index';

import { getResourcesEndpoint } from '../../api/paths';

import './style.scss';
import { Button } from '@material-ui/core';

const Resources = () => {
  const params = useParams();
  const { data: response, loading, loadPage } = useAPI(
    getResourcesEndpoint(params.service, params.resource),
    [],
    { pagination: true },
  );
  const data = response.results;

  const fetchData = React.useCallback(({ pageIndex, sortBy, direction }) => {
    loadPage(pageIndex + 1, sortBy, direction);
  }, []);

  if (loading || !data)
    return (
      <>
        <Breadcrumb />
      </>
    );

  const keys = Object.keys(data[0]);

  const columns = [{ name: 'Name', key: 'name' }];

  // AWS columns
  if (keys.includes('AvailabilityZone'))
    columns.push({ name: 'Availability Zone', key: 'AvailabilityZone' });
  if (keys.includes('DNSName'))
    columns.push({ name: 'DNS Name', key: 'DNSName' });
  if (keys.includes('SubnetId'))
    columns.push({ name: 'SubnetId', key: 'SubnetId' });

  // GCP columns
  if (keys.includes('description'))
    columns.push({ name: 'Description', key: 'description' });
  if (keys.includes('project_id'))
    columns.push({ name: 'Project ID', key: 'project_id' });
  if (keys.includes('location'))
    columns.push({ name: 'Location', key: 'location' });

  const initialState = {
    pageSize: 10,
  };

  const formatters = {
    name: Name,
  };

  const sortBy = {
    severity: sortBySeverity,
  };

  const downloadButtons = (
    <>
      <form
        method="get"
        action={`http://localhost:5000/api/services/${params.service}/resources/${params.resource}/download`}
      >
        <input
          type="hidden" name="type"
          value="json" />
        <Button
          variant="outlined"
          type="submit"
          color="secondary"
          size="small"
          startIcon={<GetAppOutlinedIcon />}
        >
          JSON
        </Button>
      </form>
      <form
        method="get"
        action={`http://localhost:5000/api/services/${params.service}/resources/${params.resource}/download`}
      >
        <input
          type="hidden" name="type"
          value="csv" />
        <Button
          variant="outlined"
          type="submit"
          color="secondary"
          size="small"
          startIcon={<GetAppOutlinedIcon />}
        >
          CSV
        </Button>
      </form>
    </>
  );

  return (
    <>
      <Breadcrumb />
      <div className="flagged-items">
        <div className="table-card">
          <Table
            columns={columns}
            data={data}
            formatters={formatters}
            sortBy={sortBy}
            fetchData={fetchData}
            manualPagination={true}
            pageCount={response.meta.total_pages}
            initialState={initialState}
            headerRight={downloadButtons}
          />
        </div>

        <div className="selected-item">
          {!params.id ? (
            <span className="no-item">No selected resource</span>
          ) : (
            <ResourcePartialWrapper title={params.id} />
          )}
        </div>
      </div>
    </>
  );
};

export default Resources;
