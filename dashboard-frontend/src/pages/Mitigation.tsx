// src/pages/Mitigation.tsx
import type { MitigationData } from '../types.ts';

interface MitigationProps {
  mitigationData: MitigationData[];
}

function Mitigation({ mitigationData }: MitigationProps) {
  return (
    <div className="container-fluid p-5">
      <h2 className="mb-4">Mitigation Education</h2>

      <div className="alert alert-info mb-4">
        <h5>Cybersecurity Awareness Module</h5>
        <p className="mb-0">
          This section provides educational information about cybersecurity
          attacks simulated in the WareSafe environment and the recommended
          mitigation strategies for each scenario.
        </p>
      </div>

      {mitigationData.map((attack) => (
        <div key={attack.attack_id} className="card shadow-sm mb-4">
          <div className="card-body">

            <h4 className="mb-3">{attack.attack_type}</h4>

            <div className="row">
              <div className="col-md-4">
                <strong>Target Component</strong>
                <div className="mt-2">{attack.target_component}</div>
              </div>
              <div className="col-md-8">
                <strong>Attack Description</strong>
                <div className="mt-2">{attack.description}</div>
              </div>
            </div>

            <hr />

            <h5 className="text-success">Recommended Mitigation</h5>
            <div className="mt-2">
              {attack.mitigation || (
                <span className="text-muted">
                  Mitigation strategy will be added here.
                </span>
              )}
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}

export default Mitigation;