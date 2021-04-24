import { ReactElement, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { IMemberListItem } from "../../model/model.typing";
import MemberStats from "../../components/MemberStats";
import MemberOrganizationDescription from "../MemberOrganizationDescription";
import MemberAvatar from "../MemberAvatar";
import MemberSocials from "../MemberSocials";
import { isLinkValid } from "../../utilities/utilities";

const MembersListItem: React.FunctionComponent<{
  isOdd: boolean;
  index: number;
  volunteer: IMemberListItem;
}> = ({ isOdd, index, volunteer }): ReactElement => {
  const [isShown, show] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    new IntersectionObserver(([containerRef]) => containerRef.isIntersecting && show(true), {
      threshold: 0,
    }).observe(ref.current);
  }, []);

  return (
    <>
      {index === 11 && <div className="members-list-divider" />}
      <div
        ref={ref}
        className={`members-list__item ${
          isOdd ? "members-list__item_odd" : "members-list__item_even"
        } ${isShown ? "members-list__item_shown" : ""} volunteer ${
          index <= 10 ? "volunteer_top" : ""
        }`}
      >
        <div className="volunteer__header">
          <div className="volunteer__avatar">
            <MemberAvatar
              {...{
                memberAvatar: volunteer.itvAvatar,
                memberFullName: volunteer.fullName,
                size: "medium",
              }}
            />
          </div>
          <div className="volunteer__bage">
            <div className="volunteer__full-name">
              <Link href={`/members/${volunteer.slug}`}>
                <a
                  className="volunteer__account-link"
                  target="_blank"
                  dangerouslySetInnerHTML={{ __html: volunteer.fullName }}
                />
              </Link>
            </div>
            <div className="volunteer__role">
              <div className="volunteer__role-bage">{volunteer.memberRole}</div>
            </div>
            <div
              className="volunteer__organization-name"
              dangerouslySetInnerHTML={{ __html: volunteer.organizationName }}
            />
          </div>
        </div>
        <div className="volunteer__stats">
          <MemberStats
            {...{
              rating: volunteer.rating,
              memberSlug: volunteer.slug,
              reviewsCount: volunteer.reviewsCount,
              xp: volunteer.xp,
              solvedProblems: volunteer.solvedProblems,
              withTopdivider: true,
              align: "left",
            }}
          />
        </div>
        {volunteer.organizationDescription && (
          <div className="volunteer__organization-description">
            <MemberOrganizationDescription
              {...{
                organizationDescription: volunteer.organizationDescription,
              }}
            />
          </div>
        )}
        <div className="volunteer__footer">
          <div className="volunteer__socials">
            <MemberSocials
              {...{
                useComponents: ["facebook", "instagram", "vk"],
                facebook: volunteer.facebook,
                instagram: volunteer.instagram,
                vk: volunteer.vk,
              }}
            />
          </div>
          {isLinkValid(volunteer.organizationSite) && (
            <div className="volunteer__organization-site">
              <a href={volunteer.organizationSite} target="_blank" rel="noreferrer">
                {new URL(volunteer.organizationSite).hostname}
              </a>
            </div>
          )}
          <div className="volunteer__registration-date">
            Регистрация{" "}
            {new Intl.DateTimeFormat("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(volunteer.registrationDate * 1000))}
          </div>
        </div>
        {index <= 10 && <div className="volunteer__index">{index}</div>}
      </div>
    </>
  );
};

export default MembersListItem;