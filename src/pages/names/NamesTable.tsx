// Copyright (c) 2020-2021 Drew Lemmy
// This file is part of KristWeb 2 under GPL-3.0.
// Full details: https://github.com/tmpim/KristWeb2/blob/master/LICENSE.txt
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Table } from "antd";

import { useTranslation } from "react-i18next";

import { KristName } from "../../krist/api/types";
import { lookupNames, LookupNamesOptions, LookupNamesResponse } from "../../krist/api/lookup";
import { getTablePaginationSettings, handleLookupTableChange } from "../../utils/table";

import { KristNameLink } from "../../components/KristNameLink";
import { ContextualAddress } from "../../components/ContextualAddress";
import { TransactionConciseMetadata } from "../../components/transactions/TransactionConciseMetadata";
import { DateTime } from "../../components/DateTime";

import Debug from "debug";
const debug = Debug("kristweb:names-table");

interface Props {
  // Number used to trigger a refresh of the names listing
  refreshingID?: number;

  addresses?: string[];
  setError?: Dispatch<SetStateAction<Error | undefined>>;
}

export function NamesTable({ refreshingID, addresses, setError }: Props): JSX.Element {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [res, setRes] = useState<LookupNamesResponse>();
  const [options, setOptions] = useState<LookupNamesOptions>({
    limit: 20,
    offset: 0,
    orderBy: "name",
    order: "ASC"
  });

  // Fetch the names from the API, mapping the table options
  useEffect(() => {
    debug("looking up names for %s", addresses ? addresses.join(",") : "network");
    setLoading(true);

    lookupNames(addresses, options)
      .then(setRes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [refreshingID, addresses, setError, options]);

  debug("results? %b  res.names.length: %d  res.count: %d  res.total: %d", !!res, res?.names?.length, res?.count, res?.total);

  return <Table<KristName>
    className="names-table"
    size="small"

    loading={loading}
    dataSource={res?.names || []}
    rowKey="name"

    // Triggered whenever the filter, sorting, or pagination changes
    onChange={handleLookupTableChange(setOptions)}
    pagination={getTablePaginationSettings(t, res, "names.tableTotal")}

    columns={[
      // Name
      {
        title: t("names.columnName"),
        dataIndex: "name", key: "name",

        render: name => <KristNameLink name={name} />,

        sorter: true,
        defaultSortOrder: "ascend"
      },

      // Owner
      {
        title: t("names.columnOwner"),
        dataIndex: "owner", key: "owner",

        render: owner => owner && (
          <ContextualAddress
            className="names-table-address"
            address={owner}
            allowWrap
          />
        ),

        sorter: true
      },

      // Original owner
      {
        title: t("names.columnOriginalOwner"),
        dataIndex: "original_owner", key: "original_owner",

        render: owner => owner && (
          <ContextualAddress
            className="names-table-address"
            address={owner}
            allowWrap
          />
        ),

        sorter: true
      },

      // A record
      {
        title: t("names.columnARecord"),
        dataIndex: "a", key: "a",

        render: a => <TransactionConciseMetadata metadata={a} />,

        sorter: true
      },

      // Unpaid blocks
      {
        title: t("names.columnUnpaid"),
        dataIndex: "unpaid", key: "unpaid",

        // TODO: highlight this?
        render: unpaid => unpaid && unpaid.toLocaleString(),
        width: 50,

        sorter: true
      },

      // Registered time
      {
        title: t("names.columnRegistered"),
        dataIndex: "registered", key: "registered",

        render: time => <DateTime date={time} />,
        width: 200,

        sorter: true
      },

      // Updated time
      {
        title: t("names.columnUpdated"),
        dataIndex: "updated", key: "updated",

        render: time => <DateTime date={time} />,
        width: 200,

        sorter: true
      }
    ]}
  />;
}