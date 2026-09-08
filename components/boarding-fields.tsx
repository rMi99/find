"use client";
import { boardingAudiences, type Boarding } from "@/lib/types";
export function BoardingFields({
  value,
  onChange,
}: {
  value: Boarding;
  onChange: (value: Boarding) => void;
}) {
  const change = <K extends keyof Boarding>(key: K, next: Boarding[K]) =>
    onChange({ ...value, [key]: next });
  return (
    <fieldset className="boarding-panel">
      <legend>Boarding room details</legend>
      <p>
        Describe one room or shared-room offer. Add separate listings for rooms
        with different prices or arrangements. Counts are people, including
        couples.
      </p>
      <div className="field-row">
        <label className="field">
          Suitable for
          <select
            value={value.audience}
            onChange={(e) =>
              change("audience", e.target.value as Boarding["audience"])
            }
          >
            {Object.entries(boardingAudiences).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          Room arrangement
          <select
            value={value.roomType}
            onChange={(e) =>
              change("roomType", e.target.value as Boarding["roomType"])
            }
          >
            <option value="shared">Shared room</option>
            <option value="private">Private room</option>
          </select>
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          People per room
          <input
            type="number"
            required
            min={value.audience === "couples" ? 2 : 1}
            max={30}
            value={value.capacity || ""}
            onChange={(e) => change("capacity", Number(e.target.value))}
          />
          <small>Choose any capacity: 1, 2, 3, 6 or more (up to 30).</small>
        </label>
        <label className="field">
          Available spaces
          <input
            type="number"
            required
            min={0}
            max={value.capacity}
            value={value.vacancies}
            onChange={(e) => change("vacancies", Number(e.target.value))}
          />
          <small>Unoccupied places in this room. Use 0 when full.</small>
        </label>
      </div>
      <div className="field-row">
        <label className="field">
          Monthly price is per
          <select
            value={value.priceBasis}
            onChange={(e) =>
              change("priceBasis", e.target.value as Boarding["priceBasis"])
            }
          >
            <option value="person">Person</option>
            <option value="room">Entire room</option>
          </select>
        </label>
        <label className="field">
          Tenant preference
          <select
            value={value.tenantType}
            onChange={(e) =>
              change("tenantType", e.target.value as Boarding["tenantType"])
            }
          >
            <option value="any">Students or professionals</option>
            <option value="students">Students</option>
            <option value="professionals">Professionals</option>
          </select>
        </label>
      </div>
    </fieldset>
  );
}
export function BoardingSummary({ value: b }: { value: Boarding }) {
  return (
    <section className="boarding-panel">
      <h2>Your boarding arrangement</h2>
      <dl className="boarding-facts">
        <div>
          <dt>Suitable for</dt>
          <dd>{boardingAudiences[b.audience]}</dd>
        </div>
        <div>
          <dt>Room</dt>
          <dd>
            {b.roomType === "shared" ? "Shared" : "Private"} · {b.capacity}{" "}
            {b.capacity === 1 ? "person" : "people"}
          </dd>
        </div>
        <div>
          <dt>Spaces available</dt>
          <dd>
            {b.vacancies} of {b.capacity}
          </dd>
        </div>
        <div>
          <dt>Monthly price</dt>
          <dd>Per {b.priceBasis === "person" ? "person" : "entire room"}</dd>
        </div>
        <div>
          <dt>Tenants</dt>
          <dd>
            {b.tenantType === "any"
              ? "Students or professionals"
              : b.tenantType === "students"
                ? "Students"
                : "Professionals"}
          </dd>
        </div>
      </dl>
      <p>
        Confirm current vacancies, deposits, utility charges, meals and house
        rules with the owner.
      </p>
    </section>
  );
}
