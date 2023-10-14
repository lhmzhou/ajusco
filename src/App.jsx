import { Events } from "./Events.jsx";
import { LiftStatus } from "./LiftStatus.jsx";
import { Hotels } from "./Hotels.jsx";
import { gql, useSuspenseQuery } from "apollo/client";
import { Suspense, useState, useTransition } from "react";

const LIFT_QUERY = gql`
  query LiftOfTheWeek($id: ID!) {
    findLifeById(id: $id) {
      id
      name
      status
    }
  }
`;

const ALL_LIFTS_QUERY = gql`
  query AllLifts {
    allLifts {
      id
      name
      status
    }
  }
`;

function LiftOfTheWeek({ id }) {
  const data = useSuspenseQuery(LIFT_QUERY, {
    variables: { id }
  });
  console.log(data);
  return <h2>Life of the Week: {data.findLiftById.name}</h2>;
}

export function App() {
  const { data } = useSuspenseQuery(ALL_LIFTS_QUERY);
  const [lift, setLift] = useState(data.allLifts[0].id);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <header>
        <h1>Snowtooth Mountain Info</h1>
        <Suspense fallback="loading">
          <select
            style = {{color: isPending ? "red" : "black"}}
            onChange={(e) => { 
              startTransition(() =>
                setLift(e.target.value)
              );
            }}
          >
            {data.allLifts.map(({id, name}) =>(
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <LiftOfTheWeek id={lift} />
        </Suspense>
      </header>
      <section className="container">
        <Events />
        <LiftStatus />
        <Hotels />
      </section>
    </>
  );
}