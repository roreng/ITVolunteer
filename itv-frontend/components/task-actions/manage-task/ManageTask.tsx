/* eslint-disable react/display-name */
import { ReactElement, useState, useEffect, useContext, useRef, SyntheticEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useStoreState, useStoreActions } from "../../../model/helpers/hooks";
import ManageTaskStep from "./ManageTaskStep";
import ManageTaskForm from "./ManageTaskForm";
import ManageTaskStep2Footer from "./ManageTaskStep2Footer";
import SimpleTaskExplanation from "./agreement-explanations/SimpleTaskExplanation";
import SocialProblemExplanation from "./agreement-explanations/SocialProblemExplanation";
import EffectiveCooperationExplanation from "./agreement-explanations/EffectiveCooperationExplanation";
import BeInTouchExplanation from "./agreement-explanations/BeInTouchExplanation";
import PersonalDataSecurityExplanation from "./agreement-explanations/PersonalDataSecurityExplanation";
import FormControlInput from "../../ui/form/FormControlInput";
import FormControlTextarea from "../../ui/form/FormControlTextarea";
import FormControlSelect from "../../ui/form/FormControlSelect";
import FormControlInputDate from "../../ui/form/FormControlInputDate";
import FormControlInputCheckbox from "../../ui/form/FormControlInputCheckbox";
import Tooltip from "../../global-scripts/Tooltip";
import UploadFileInput, { FileItem } from "../../UploadFileInput";
import { IManageTaskFormData } from "../../../model/model.typing";
import GlobalScripts, { ISnackbarMessage } from "../../../context/global-scripts";
import {
  convertDateToLocalISOString,
  convertObjectToClassName,
} from "../../../utilities/utilities";
import styles from "../../../assets/sass/modules/ManageTask.module.scss";
import tooltipStyles from "../../../assets/sass/modules/Tooltip.module.scss";

const { ScreenLoaderContext } = GlobalScripts;

const stepCount = 2;
const minPreferredDuration = convertDateToLocalISOString({
  date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
});

const calculateInformativenessLevel = (taskRef: IManageTaskFormData): number => {
  let level = 0;

  if (Object.is(taskRef, null)) return level;

  const { title, description, taskTags, ngoTags, reward, files, preferredDuration } = taskRef;

  level += title ? 20 : 0;
  level += description ? 20 : 0;
  level += taskTags.value.length > 0 ? 15 : 0;
  level += ngoTags.value ? 15 : 0;
  level += reward.value ? 10 : 0;
  level += files instanceof Array && files.length > 0 ? 10 : 0;
  level += preferredDuration ? 10 : 0;

  return level;
};

const ManageTask: React.FunctionComponent<{
  // eslint-disable-next-line no-unused-vars
  addSnackbar: (message: ISnackbarMessage) => void;
  clearSnackbar: () => void;
}> = ({ addSnackbar, clearSnackbar }): ReactElement => {
  const { isLoggedIn, isLoaded } = useStoreState(state => state.session);
  const userRole = useStoreState(state => state.session.user.itvRole);
  const userSlug = useStoreState(state => state.session.user.slug);
  const organizationName = useStoreState(state => state.session.user.organizationName);
  const tags = useStoreState(state => state.components.manageTask.tags);
  const ngoTags = useStoreState(state => state.components.manageTask.ngoTags);
  const reward = useStoreState(state => state.components.manageTask.reward);
  const formData = useStoreState(state => state.components.manageTask.formData);
  const taskId = useStoreState(state => state.components.manageTask.id);
  const taskSlug = useStoreState(state => state.components.manageTask.slug);
  const [formDisabled, setFormDisabled] = useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [isPrinciplesAccepted, setIsPrinciplesAccepted] = useState<boolean>(false);
  const [isFileListShown, setIsFileListShown] = useState<boolean>(false);
  const [isDeadlineShown, setIsDeadlineShown] = useState<boolean>(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState<boolean>(false);
  const [isEditMode] = useState<boolean>(Boolean(taskId) && Boolean(taskSlug));
  const taskRef = useRef<IManageTaskFormData>(null);
  const screenLoader = useContext(ScreenLoaderContext);

  const {
    initializeState,
    loadTags,
    loadNgoTags,
    loadReward,
    setFormData,
    setInformativenessLevel,
    submitFormData,
  } = useStoreActions(actions => actions.components.manageTask);

  const router = useRouter();

  const goPrevStep = () => {
    setStep(step - 1);
  };

  const goNextStep = () => {
    setStep(step + 1);
  };

  const goToStep1 = (event: Event): void => {
    event.preventDefault();
    
    goNextStep();
  };

  const goToStep2 = (event: Event): void => {
    event.preventDefault();

    Array.from((event.currentTarget as HTMLFormElement).elements).forEach(
      (control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
        if (["title", "description", "taskTags", "ngoTags"].includes(control.name)) {
          control.required = true;
        }
      }
    );

    if ((event.currentTarget as HTMLFormElement).checkValidity()) {
      clearSnackbar();
      goNextStep();
    } else {
      addSnackbar({
        context: "error",
        text: "Пожалуйста, заполните все обязательные поля.",
      });
    }
  };

  const publishTask = (event: Event): void => {
    event.preventDefault();

    if (!isLoggedIn) {
      router.push({ pathname: "/login" });
    } else if (userRole === "doer") {
      router.push({ pathname: "/members/[username]", query: { username: userSlug } });
    }

    setFormDisabled(true);
    screenLoader.dispatch({ type: "open" });
    setFormData(taskRef.current);
    submitFormData({
      addSnackbar,
      setIsFormSubmitted,
      callback: ({ taskSlug }) => {
        setFormDisabled(false);
        screenLoader.dispatch({ type: "close" });
        router.push({ pathname: "/tasks/[slug]", query: { slug: taskSlug } });
      },
    });
  };

  const checkboxChangeHandler = (event: SyntheticEvent<HTMLInputElement>) => {
    taskRef.current.agreement[event.currentTarget.name] = event.currentTarget.checked;

    if (Object.values(taskRef.current.agreement).every(isAccepted => isAccepted)) {
      setIsPrinciplesAccepted(true);
    }
  };

  const pasekaChangeHandler = (event: SyntheticEvent<HTMLInputElement>) => {
    taskRef.current[event.currentTarget.name] = event.currentTarget.checked ? "1" : "0";
  };

  const controlChangeHandler = (event: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    taskRef.current[event.currentTarget.name] = event.currentTarget.value;

    setInformativenessLevel(calculateInformativenessLevel(taskRef.current));
  };

  const taskTagsGuardHandler = (event: SyntheticEvent<HTMLSelectElement>): boolean => {
    if (
      taskRef.current["taskTags"].value.length === 2 &&
      event.currentTarget.selectedOptions.length === 2
    ) {
      addSnackbar({
        context: "error",
        text: "Можно выбрать одновременно не более двух категорий.",
      });

      return true;
    }

    clearSnackbar();

    return false;
  };

  const selectMultipleChangeHandler = (event: SyntheticEvent<HTMLSelectElement>) => {
    if (taskTagsGuardHandler(event)) return;

    taskRef.current[event.currentTarget.name] = {
      value: Array.from(event.currentTarget.selectedOptions).map(option => option.value),
    };

    setInformativenessLevel(calculateInformativenessLevel(taskRef.current));
  };

  const selectChangeHandler = (event: SyntheticEvent<HTMLSelectElement>) => {
    taskRef.current[event.currentTarget.name] = {
      index: event.currentTarget.selectedIndex - 1,
      value: event.currentTarget.selectedOptions[0].value,
    };

    setInformativenessLevel(calculateInformativenessLevel(taskRef.current));
  };

  const fileUploadHandler = (event: CustomEvent<{ files: Array<FileItem> }>) => {
    taskRef.current.files = event.detail.files;

    setInformativenessLevel(calculateInformativenessLevel(taskRef.current));
  };

  const fileRemoveHandler = (event: CustomEvent<{ files: Array<FileItem> }>) => {
    taskRef.current.files = event.detail.files;

    setInformativenessLevel(calculateInformativenessLevel(taskRef.current));
  };

  const beforeUserLeavesFormHandle = (): void => {
    if (!isEditMode) {
      if (isFormSubmitted) {
        localStorage?.removeItem("itv.manageTask");
      } else {
        localStorage?.setItem(
          "itv.manageTask",
          JSON.stringify({
            step,
            formData: taskRef.current,
          })
        );
      }
    }

    initializeState();
  };

  useEffect(() => {
    loadTags();
    loadNgoTags();
    loadReward();

    return () => {
      window.dispatchEvent(new Event("beforeunload"));
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoaded, router]);

  useEffect(() => {
    if (!isEditMode) {
      const savedRawData = localStorage?.getItem("itv.manageTask");
      const savedData = savedRawData ? JSON.parse(savedRawData) : null;

      savedData?.formData && setFormData(savedData.formData);

      savedData?.step && setStep(savedData.step);
    }
  }, [isEditMode]);

  useEffect(() => {
    isEditMode && step < 1 && setStep(1);
  }, [isEditMode, step]);

  useEffect(() => {
    taskRef.current = { ...formData };

    Object.values(taskRef.current.agreement).every(checked => checked) &&
      setIsPrinciplesAccepted(true);

    taskRef.current.files instanceof Array &&
      taskRef.current.files.length > 0 &&
      setIsFileListShown(true);

    taskRef.current.preferredDuration && setIsDeadlineShown(true);

    setInformativenessLevel(calculateInformativenessLevel(taskRef.current));
  }, [formData]);

  useEffect(() => {
    window.addEventListener("beforeunload", beforeUserLeavesFormHandle);
    return () => {
      window.removeEventListener("beforeunload", beforeUserLeavesFormHandle);
    };
  }, [step, isFormSubmitted]);

  return (
    <div
      className={`${styles["manage-task"]} ${
        step === 0 ? "" : styles["manage-task_bg-image"]
      }`.trim()}
    >
      {step === 0 && (
        <ManageTaskStep showInformativeness={false}>
          <ManageTaskForm
            {...{
              title: "Согласие с принципами IT-волонтёра",
              submitTitle: "Всё верно, с принципами соглашаюсь",
              submitHandler: goToStep1,
              submitDisabled: !isPrinciplesAccepted,
            }}
          >
            <div className={styles["manage-task-agreement"]}>
              <div className={styles["manage-task-lead"]}>
                Публикуя задачу на IT-волонтёре, подтверждаю, что:
              </div>
              <FormControlInputCheckbox
                label="Я ставлю простую задачу"
                name="simpleTask"
                defaultChecked={taskRef.current?.agreement.simpleTask}
                required
                Explanation={SimpleTaskExplanation}
                onChange={checkboxChangeHandler}
              />
              <FormControlInputCheckbox
                label="Мой проект решает социальную проблему"
                name="socialProblem"
                defaultChecked={taskRef.current?.agreement.socialProblem}
                required
                Explanation={SocialProblemExplanation}
                onChange={checkboxChangeHandler}
              />
              <FormControlInputCheckbox
                label="Умею работать с волонтёрами"
                name="effectiveCooperation"
                defaultChecked={taskRef.current?.agreement.effectiveCooperation}
                required
                Explanation={EffectiveCooperationExplanation}
                onChange={checkboxChangeHandler}
              />
              <FormControlInputCheckbox
                label="Буду на связи"
                name="beInTouch"
                defaultChecked={taskRef.current?.agreement.beInTouch}
                required
                Explanation={BeInTouchExplanation}
                onChange={checkboxChangeHandler}
              />
              <FormControlInputCheckbox
                label="Позабочусь о безопасности своих данных"
                name="personalDataSecurity"
                defaultChecked={taskRef.current?.agreement.personalDataSecurity}
                required
                Explanation={PersonalDataSecurityExplanation}
                onChange={checkboxChangeHandler}
              />
            </div>
          </ManageTaskForm>
        </ManageTaskStep>
      )}
      {step === 1 && (
        <ManageTaskStep>
          <ManageTaskForm
            {...{
              title: isEditMode ? "Редактирование задачи" : "Новая задача",
              subtitle: `Шаг ${step} из ${stepCount}`,
              submitTitle: "Следующий шаг",
              submitHandler: goToStep2,
            }}
          >
            <FormControlInput
              label="Название"
              labelExtraClassName="form__label_small form__label_required"
              className="form__control_input form__control_input-small form__control_full-width form__control_input-with-counter"
              type="text"
              name="title"
              maxLength={70}
              defaultValue={taskRef.current?.title}
              placeholder="Что нужно сделать?"
              onChange={controlChangeHandler}
            />
            <FormControlTextarea
              label="Описание"
              labelExtraClassName="form__label_small form__label_required"
              className="form__control_textarea form__control_textarea-small form__control_full-width"
              name="description"
              defaultValue={taskRef.current?.description}
              placeholder="Какая задача стоит перед IT-волонтером? Привидите примеры успешной реализации. Опишите результат"
              onChange={controlChangeHandler}
            />
            <FormControlSelect
              label="Категория"
              labelExtraClassName="form__label_small form__label_required"
              selectExtraClassName="form__select-control_small form__control_full-width"
              selectPlaceholder="Выберите категорию"
              maxSelectedOptions={2}
              name="taskTags"
              defaultValue={taskRef.current?.taskTags.value.map(value => String(value))}
              multiple
              onChange={selectMultipleChangeHandler}
            >
              {tags?.map(tag => ({
                value: tag.id,
                label: tag.name,
                "data-parent": tag.parent,
              }))}
            </FormControlSelect>
            <FormControlSelect
              label="Направление помощи"
              labelExtraClassName="form__label_small form__label_required"
              selectExtraClassName="form__select-control_small form__control_full-width"
              selectPlaceholder="Выберите направление"
              name="ngoTags"
              defaultValue={taskRef.current?.ngoTags.value}
              onChange={selectChangeHandler}
            >
              {ngoTags?.map(tag => ({
                value: tag.id,
                label: tag.name,
                "data-parent": tag.parent,
              }))}
            </FormControlSelect>
          </ManageTaskForm>
        </ManageTaskStep>
      )}
      {step === 2 && (
        <ManageTaskStep>
          <ManageTaskForm
            {...{
              title: "Дополнительно о задаче",
              subtitle: `Шаг ${step} из ${stepCount}`,
              submitTitle: isEditMode ? "Сохранить изменения" : "Опубликовать",
              submitHandler: publishTask,
              FormFooter: <ManageTaskStep2Footer {...{ goPrevStep }} />,
              disabled: formDisabled,
            }}
          >
            <FormControlSelect
              label="Вознаграждение"
              labelExtraClassName="form__label_small"
              selectExtraClassName="form__select-control_small form__control_full-width"
              selectPlaceholder="Выберите вознаграждение"
              name="reward"
              defaultValue={taskRef.current?.reward.value}
              onChange={selectChangeHandler}
            >
              {reward?.map(tag => ({
                value: tag.id,
                label: tag.name,
              }))}
            </FormControlSelect>
            <div className="form__group">
              {(isFileListShown && (
                <UploadFileInput
                  description="Перетащите файлы в выделенную область для загрузки или кликните на кнопку Загрузить"
                  name="files"
                  isMultiple={true}
                  initFileData={taskRef.current?.files?.map(file => ({
                    mediaItemUrl: file.fileName,
                    databaseId: file.value,
                  }))}
                  onUpload={fileUploadHandler}
                  onRemove={fileRemoveHandler}
                />
              )) || (
                <div className={styles["manage-task__action-container"]}>
                  <a
                    href="#"
                    className={`${styles["manage-task__action-link"]} ${styles["manage-task__action-link_default"]}`}
                    onClick={event => {
                      event.preventDefault();
                      setIsFileListShown(true);
                    }}
                  >
                    Загрузить файлы
                  </a>
                </div>
              )}
            </div>
            {(isDeadlineShown && (
              <FormControlInputDate
                label="Дата дедлайна"
                labelExtraClassName="form__label_small"
                inputDatePlaceholder="Выберите дату"
                name="preferredDuration"
                defaultValue={taskRef.current?.preferredDuration}
                min={minPreferredDuration}
                onChange={controlChangeHandler}
              />
            )) || (
              <div className="form__group">
                <div className={styles["manage-task__action-container"]}>
                  <a
                    href="#"
                    className={`${styles["manage-task__action-link"]} ${styles["manage-task__action-link_default"]}`}
                    onClick={event => {
                      event.preventDefault();
                      setIsDeadlineShown(true);
                    }}
                  >
                    Указать дедлайн
                  </a>
                  <div className={styles["manage-task__tooltip-inline"]}>
                    {`Автоматически будет дедлайн ${new Date(
                      Date.now() + 14 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            )}
            <div className={styles["manage-task-form__checkbox-container"]}>
              <div className="form__label form__label_small">Кто может откликнуться на задачу?</div>
              <FormControlInputCheckbox
                label="Пасека"
                afterlabel={organizationName ? "btn" : "link"}
                name="isPasekaChecked"
                defaultChecked={["1", true].includes(formData.isPasekaChecked)}
                required
                onChange={pasekaChangeHandler}
                disabled={!organizationName}
              >
                <Tooltip putMarkerToCenter={false}>
                  {organizationName ? (
                    <button
                      className={tooltipStyles["tooltip__component-btn"]}
                      type="button"
                      data-tooltip-btn={true}
                    />
                  ) : (
                    <a
                      href="#"
                      className={convertObjectToClassName({
                        [styles["manage-task__action-link"]]: true,
                        [styles["manage-task__action-link_primary"]]: true,
                        [styles["manage-task__action-link_size-md"]]: true,
                      })}
                      data-tooltip-btn={true}
                    >
                      Почему мне недоступна эта опция?
                    </a>
                  )}

                  <div
                    className={tooltipStyles["tooltip__component-body"]}
                    data-tooltip-body={true}
                  >
                    {organizationName ? (
                      <p>
                        На задачи с меткой «Пасека» откликаются опытные специалисты и веб-студии.
                        Поставьте галочку, если у вас есть бюджет, а задача сложная и требует
                        команды профессионалов.
                      </p>
                    ) : (
                      <p>
                        На задачу с меткой «Пасека» откликаются опытные специалисты и веб-студии.
                        Они работают только с юридическими лицами. Пожалуйста,{" "}
                        <Link
                          href="/members/[username]/profile"
                          as={`/members/${userSlug}/profile`}
                        >
                          <a>расскажите о вашей организации</a>
                        </Link>
                        , если вы хотите ставить задачи для Пасеки.
                      </p>
                    )}
                  </div>
                </Tooltip>
              </FormControlInputCheckbox>
            </div>
          </ManageTaskForm>
        </ManageTaskStep>
      )}
    </div>
  );
};

export default ManageTask;