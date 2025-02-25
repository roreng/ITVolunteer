import { ReactElement } from "react";
import { useStoreState, useStoreActions } from "../../model/helpers/hooks";
import { ITaskDoer } from "../../model/model.typing";
import TaskAuthorActionsOnDoer from "./TaskAuthorActionsOnDoer";
import IconPaseka from "../../assets/img/icon-paseka.svg";

const TaskDoer: React.FunctionComponent<ITaskDoer> = (doer): ReactElement => {
  const { id: taskId, doers } = useStoreState((state) => state.components.task);
  const {
    manageDoerRequest: manageDoer,
    updateApprovedDoer,
    updateDoers,
    taskRequest,
    timelineRequest,
  } = useStoreActions((actions) => actions.components.task);
  const {
    fullName,
    profileURL: toProfile,
    itvAvatar: avatarImage,
    solvedTasksCount,
    doerReviewsCount,
    isPasekaMember,
  } = doer;
  const approveFn = manageDoer.bind(null, {
    action: "approve-candidate",
    taskId,
    doer,
    callbackFn: function() {
      updateApprovedDoer(doer);
      taskRequest();
      timelineRequest();
    }
  });
  const declineFn = manageDoer.bind(null, {
    action: "decline-candidate",
    taskId,
    doer,
    callbackFn: updateDoers.bind(
      null,
      doers.filter(({ id }) => id !== doer.id)
    ),
  });

  return (
    <div className="user-card">
      <div className="user-card-inner">
        <div
          className="avatar-wrapper"
          style={{
            backgroundImage: avatarImage ? `url(${avatarImage})` : "none",
          }}
        >
          {isPasekaMember && <img src={IconPaseka} className="itv-approved" />}
        </div>
        <div className="details">
          <a className="name" href={toProfile}>
            {fullName}
          </a>
          <span className="reviews">{`${doerReviewsCount} отзывов`}</span>
          <span className="status">{`Выполнено ${solvedTasksCount} задач`}</span>
        </div>
      </div>
      <TaskAuthorActionsOnDoer approve={approveFn} decline={declineFn} />
    </div>
  );
};

export default TaskDoer;
