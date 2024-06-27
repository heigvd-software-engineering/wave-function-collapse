export class BoundaryConstraint {
  static ConstraintMode = {
    EnforceConnector: "EnforceConnector",
    ExcludeConnector: "ExcludeConnector",
  };

  static ConstraintDirection = {
    Up: "Up",
    Down: "Down",
    Horizontal: "Horizontal",
  };

  constructor() {
    this.relativeY = 0;
    this.direction = BoundaryConstraint.ConstraintDirection.Up;
    this.mode = BoundaryConstraint.ConstraintMode.EnforceConnector;
    this.connector = 0;
  }
}
