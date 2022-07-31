import React, { FunctionComponent, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById, getShifts, publishShiftByWeek } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { useHistory } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
import { Button, Typography } from '@material-ui/core';
import moment from 'moment';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: 'white',
    color: theme.color.turquoise
  },
  turquoise: {
    color: theme.color.turquoise
  },
  wrapIcon: {
    verticalAlign: 'middle',
    display: 'inline-flex'
  }
}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
  isPublished: boolean;
}
const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
  isPublished
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="delete"
        component={RouterLink}
        to={`/shift/${id}/edit`}
        disabled={isPublished}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" aria-label="delete" onClick={() => onDelete()} disabled={isPublished}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

const Shift = () => {
  const classes = useStyles();
  const history = useHistory();

  const [rows, setRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [selectedWeek, setSelectedWeek] = useState(moment());
  const [isPublished, setIsPublished] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setErrMsg("");
        const startWeek = selectedWeek.startOf("isoWeek").format("YYYY-MM-DD").toString();
        const endWeek = selectedWeek.endOf("isoWeek").format("YYYY-MM-DD").toString();
        const { results } = await getShifts(startWeek, endWeek);

        setIsPublished(results[0]?.isPublished);
        setRows(results);
      } catch (error) {
        const message = getErrorMessage(error);
        setErrMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [selectedWeek]);

  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
    },
    {
      name: "Date",
      selector: "date",
      sortable: true,
    },
    {
      name: "Start Time",
      selector: "startTime",
      sortable: true,
    },
    {
      name: "End Time",
      selector: "endTime",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <ActionButton id={row.id} onDelete={() => onDeleteClick(row.id)} isPublished={isPublished} />
      ),
    },
  ];

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      console.log(deleteDataById);

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };

  const publishShift = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      const payload = {
        start: selectedWeek.startOf("isoWeek").format("YYYY-MM-DD"),
        end: selectedWeek.endOf("isoWeek").format("YYYY-MM-DD")
      };
      await publishShiftByWeek(payload);

    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
      setIsPublished(false);
    } finally {
      setIsPublished(true);
      setDeleteLoading(false);
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : (
              <></>
            )}
            <DataTable
              title={
                <Grid container alignContent="center" alignItems="center">
                  <Grid item>
                    <IconButton onClick={() => setSelectedWeek(moment(selectedWeek.subtract(1, "weeks")))}>
                      <NavigateBeforeIcon />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Typography color={isPublished ? "error" : "primary"}>
                      {`${selectedWeek.startOf("isoWeek").format("MMM DD")} - ${selectedWeek.endOf("isoWeek").format("MMM DD")}`}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton onClick={() => setSelectedWeek(moment(selectedWeek.add(1, "weeks")))}>
                      <NavigateNextIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              }
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
              actions={[
                isPublished ?
                  <Typography key="published-timestamp" color="error" className={classes.wrapIcon}>
                    <CheckCircleIcon />
                    {`Week published on ${moment(rows[0]?.publishedAt).format("DD-MMM-YYYY, hh:mm A")}`}
                  </Typography> : null,
                <Button key="button-add-shift" color="primary" variant="outlined" onClick={() => history.push("/shift/add")}>add shift</Button>,
                <Button key="button-publish-shift" disabled={isPublished} color="primary" onClick={publishShift}>publish</Button>
              ]}
            />
          </CardContent>
        </Card>
      </Grid>
      <Fab
        size="medium"
        aria-label="add"
        className={classes.fab}
        onClick={() => history.push("/shift/add")}
      >
        <AddIcon />
      </Fab>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
    </Grid>
  );
};

export default Shift;
